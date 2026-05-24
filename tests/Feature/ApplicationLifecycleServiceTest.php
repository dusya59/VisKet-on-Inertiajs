<?php

use App\Events\ApplicationStatusChanged;
use App\Models\Application;
use App\Models\Chat;
use App\Models\Dispute;
use App\Models\Message;
use App\Models\Post;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Vacancy;
use App\Services\ApplicationLifecycleService;
use Illuminate\Support\Facades\Event;

beforeEach(function () {
    $this->service = new ApplicationLifecycleService();
});

function createVacancyWithClientAndExecutor(): array
{
    $client = User::factory()->create(['balance' => 100000]);
    $executor = User::factory()->create(['balance' => 0]);
    $post = Post::factory()->vacancy()->create(['user_id' => $client->id]);
    $vacancy = Vacancy::factory()->for('post')->create(['post_id' => $post->id]);

    return [$vacancy, $client, $executor];
}

describe('create()', function () {
    test('creates application, chat and attaches users', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'I am interested',
            'proposed_price' => 50000,
        ]);

        expect($application)->toBeInstanceOf(Application::class)
            ->and($application->status)->toBe('pending')
            ->and($application->vacancy_id)->toBe($vacancy->id)
            ->and($application->user_id)->toBe($executor->id)
            ->and($application->cover_letter)->toBe('I am interested')
            ->and($application->proposed_price)->toBe(50000)
            ->and($application->chat)->toBeInstanceOf(Chat::class)
            ->and($application->chat->users)->toHaveCount(2)
            ->and($application->chat->users->pluck('id')->sort()->values()->toArray())->toBe([$client->id, $executor->id]);
    });

    test('throws if user already has active application on same vacancy', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $this->service->create($vacancy, $executor, [
            'cover_letter' => 'First',
            'proposed_price' => 50000,
        ]);

        expect(fn () => $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Second',
            'proposed_price' => 60000,
        ]))->toThrow(RuntimeException::class, 'У вас уже есть активная заявка на эту вакансию.');
    });

    test('allows new application if previous is cancelled', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        Application::factory()->cancelled()->create([
            'vacancy_id' => $vacancy->id,
            'user_id' => $executor->id,
        ]);

        $app = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Try again',
            'proposed_price' => 55000,
        ]);

        expect($app->status)->toBe('pending');
    });

    test('allows new application if previous is completed', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        Application::factory()->completed()->create([
            'vacancy_id' => $vacancy->id,
            'user_id' => $executor->id,
        ]);

        $app = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Again',
            'proposed_price' => 40000,
        ]);

        expect($app->status)->toBe('pending');
    });

    test('allows new application if previous is rejected', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        Application::factory()->rejected()->create([
            'vacancy_id' => $vacancy->id,
            'user_id' => $executor->id,
        ]);

        $app = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Third attempt',
            'proposed_price' => 45000,
        ]);

        expect($app->status)->toBe('pending');
    });

    test('allows new application if previous is withdrawn', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        Application::factory()->withdrawn()->create([
            'vacancy_id' => $vacancy->id,
            'user_id' => $executor->id,
        ]);

        $app = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'New try',
            'proposed_price' => 30000,
        ]);

        expect($app->status)->toBe('pending');
    });

    test('creates application without proposed_price', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'No price',
        ]);

        expect($application->proposed_price)->toBeNull();
    });
});

describe('accept()', function () {
    test('happy path: accepts application, creates transaction, deducts balance', function () {
        Event::fake();

        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Hire me',
            'proposed_price' => 50000,
        ]);

        $this->service->accept($application, $client);

        $application->refresh();

        expect($application->status)->toBe('in_progress')
            ->and($application->accepted_at)->not->toBeNull()
            ->and($application->in_progress_at)->not->toBeNull()
            ->and($client->refresh()->balance)->toBe('50000.00')
            ->and($vacancy->refresh()->status)->toBe('in_progress');

        $transaction = $application->transaction;
        expect($transaction)->not->toBeNull()
            ->and($transaction->from_user_id)->toBe($client->id)
            ->and($transaction->to_user_id)->toBeNull()
            ->and($transaction->amount)->toBe('50000.00')
            ->and($transaction->type)->toBe('payment')
            ->and($transaction->status)->toBe('pending')
            ->and($transaction->application_id)->toBe($application->id);

        $systemMessage = $application->chat->messages()->where('is_system', true)->first();
        expect($systemMessage)->not->toBeNull()
            ->and($systemMessage->content)->toBe('Сделка началась, средства заморожены.');

        Event::assertDispatched(ApplicationStatusChanged::class, function ($event) {
            return $event->newStatus === 'in_progress';
        });
    });

    test('throws if application is not pending', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = Application::factory()->inProgress()->create([
            'vacancy_id' => $vacancy->id,
            'user_id' => $executor->id,
            'proposed_price' => 50000,
        ]);

        expect(fn () => $this->service->accept($application, $client))
            ->toThrow(RuntimeException::class, 'Заявку нельзя принять.');
    });

    test('throws if proposed_price is null', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'No price',
        ]);

        expect(fn () => $this->service->accept($application, $client))
            ->toThrow(RuntimeException::class, 'Укажите корректную сумму для оплаты.');
    });

    test('throws if proposed_price is zero or negative', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = Application::factory()->pending()->create([
            'vacancy_id' => $vacancy->id,
            'user_id' => $executor->id,
            'proposed_price' => 0,
        ]);

        expect(fn () => $this->service->accept($application, $client))
            ->toThrow(RuntimeException::class, 'Укажите корректную сумму для оплаты.');
    });

    test('throws if client has insufficient balance', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $client->update(['balance' => 1000]);

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Hire me',
            'proposed_price' => 50000,
        ]);

        expect(fn () => $this->service->accept($application, $client))
            ->toThrow(RuntimeException::class, 'Недостаточно средств на балансе.');

        expect($client->refresh()->balance)->toBe('1000.00');
    });
});

describe('markDoneByExecutor()', function () {
    test('happy path: marks executor completed, sends message, dispatches event', function () {
        Event::fake();

        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Hire me',
            'proposed_price' => 50000,
        ]);

        $this->service->accept($application, $client);

        $this->service->markDoneByExecutor($application, $executor);

        $application->refresh();

        expect($application->executor_marked_completed_at)->not->toBeNull()
            ->and($application->status)->toBe('in_progress');

        $systemMessage = $application->chat->messages()->where('is_system', true)
            ->where('content', 'Исполнитель отметил работу как выполненную. Ожидается подтверждение заказчика.')->first();
        expect($systemMessage)->not->toBeNull();

        Event::assertDispatched(ApplicationStatusChanged::class, function ($event) {
            return $event->newStatus === 'executor_marked_done';
        });
    });

    test('throws if application is not in_progress', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = Application::factory()->pending()->create([
            'vacancy_id' => $vacancy->id,
            'user_id' => $executor->id,
            'proposed_price' => 50000,
        ]);

        expect(fn () => $this->service->markDoneByExecutor($application, $executor))
            ->toThrow(RuntimeException::class, 'Невозможно отметить работу как выполненную.');
    });

    test('throws if executor already marked done', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = Application::factory()->executorMarkedDone()->create([
            'vacancy_id' => $vacancy->id,
            'user_id' => $executor->id,
            'proposed_price' => 50000,
        ]);

        expect(fn () => $this->service->markDoneByExecutor($application, $executor))
            ->toThrow(RuntimeException::class, 'Невозможно отметить работу как выполненную.');
    });
});

describe('completeByClient()', function () {
    test('happy path: completes application, transfers money, closes vacancy', function () {
        Event::fake();

        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Hire me',
            'proposed_price' => 50000,
        ]);

        $this->service->accept($application, $client);
        $this->service->markDoneByExecutor($application, $executor);

        $this->service->completeByClient($application, $client);

        $application->refresh();
        $executor->refresh();
        $vacancy->refresh();
        $post = $vacancy->post;

        expect($application->status)->toBe('completed')
            ->and($application->completed_at)->not->toBeNull()
            ->and($executor->balance)->toBe('50000.00')
            ->and($vacancy->status)->toBe('closed')
            ->and($post->status)->toBe('closed')
            ->and($post->active)->toBeFalse();

        $transaction = $application->transaction;
        expect($transaction->status)->toBe('completed')
            ->and($transaction->to_user_id)->toBe($executor->id)
            ->and($transaction->completed_at)->not->toBeNull();

        $systemMessage = $application->chat->messages()->where('is_system', true)
            ->where('content', 'Сделка завершена.')->first();
        expect($systemMessage)->not->toBeNull();

        Event::assertDispatched(ApplicationStatusChanged::class, function ($event) {
            return $event->newStatus === 'completed';
        });
    });

    test('throws if application cannot be completed by client', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Hire me',
            'proposed_price' => 50000,
        ]);

        $this->service->accept($application, $client);

        expect(fn () => $this->service->completeByClient($application, $client))
            ->toThrow(RuntimeException::class, 'Невозможно подтвердить завершение.');
    });

    test('handles missing transaction gracefully', function () {
        Event::fake();

        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = Application::factory()->executorMarkedDone()->create([
            'vacancy_id' => $vacancy->id,
            'user_id' => $executor->id,
            'proposed_price' => 50000,
        ]);

        $chat = Chat::factory()->create(['application_id' => $application->id]);
        $chat->users()->attach([$client->id, $executor->id]);

        $this->service->completeByClient($application, $client);

        $application->refresh();

        expect($application->status)->toBe('completed');
    });

    test('handles non-pending transaction gracefully', function () {
        Event::fake();

        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Hire me',
            'proposed_price' => 50000,
        ]);

        $this->service->accept($application, $client);
        $this->service->markDoneByExecutor($application, $executor);

        $application->transaction->update(['status' => 'completed']);

        $this->service->completeByClient($application, $client);

        $application->refresh();

        expect($application->status)->toBe('completed')
            ->and($vacancy->refresh()->status)->toBe('closed');
    });
});

describe('requestCancel()', function () {
    test('happy path: cancels application, refunds client, reopens vacancy', function () {
        Event::fake();

        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Hire me',
            'proposed_price' => 50000,
        ]);

        $this->service->accept($application, $client);

        $this->service->requestCancel($application, $client, 'Changed mind');

        $application->refresh();
        $client->refresh();
        $vacancy->refresh();

        expect($application->status)->toBe('cancelled')
            ->and($application->cancelled_at)->not->toBeNull()
            ->and($client->balance)->toBe('100000.00')
            ->and($vacancy->status)->toBe('open');

        $transaction = $application->transaction;
        expect($transaction->status)->toBe('cancelled');

        $systemMessage = $application->chat->messages()->where('is_system', true)
            ->where('content', 'Сделка отменена. Причина: Changed mind')->first();
        expect($systemMessage)->not->toBeNull();

        Event::assertDispatched(ApplicationStatusChanged::class, function ($event) {
            return $event->newStatus === 'cancelled';
        });
    });

    test('cancel works when initiated by executor', function () {
        Event::fake();

        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Hire me',
            'proposed_price' => 50000,
        ]);

        $this->service->accept($application, $client);

        $this->service->requestCancel($application, $executor, 'Executor quit');

        $application->refresh();

        expect($application->status)->toBe('cancelled')
            ->and($client->refresh()->balance)->toBe('100000.00');
    });

    test('throws if application cannot be cancelled', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = Application::factory()->pending()->create([
            'vacancy_id' => $vacancy->id,
            'user_id' => $executor->id,
            'proposed_price' => 50000,
        ]);

        expect(fn () => $this->service->requestCancel($application, $client, 'No'))
            ->toThrow(RuntimeException::class, 'Отмена невозможна в текущем статусе.');
    });

    test('throws if other party cannot be determined', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = Application::factory()->inProgress()->create([
            'vacancy_id' => $vacancy->id,
            'user_id' => $executor->id,
            'proposed_price' => 50000,
        ]);

        $randomUser = User::factory()->create();

        expect(fn () => $this->service->requestCancel($application, $randomUser, 'No'))
            ->toThrow(RuntimeException::class, 'Не удалось определить контрагента.');
    });
});

describe('dispute()', function () {
    test('happy path: creates dispute, adds admin to chat, sends message', function () {
        Event::fake();

        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $admin = User::factory()->create(['is_admin' => true]);

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Hire me',
            'proposed_price' => 50000,
        ]);

        $this->service->accept($application, $client);

        $dispute = $this->service->dispute($application, $client, 'Not delivering');

        $application->refresh();

        expect($dispute)->toBeInstanceOf(Dispute::class)
            ->and($dispute->status)->toBe('open')
            ->and($dispute->initiator_id)->toBe($client->id)
            ->and($dispute->reason)->toBe('Not delivering')
            ->and($dispute->application_id)->toBe($application->id)
            ->and($application->status)->toBe('disputed')
            ->and($application->disputed_at)->not->toBeNull();

        expect($application->chat->users->pluck('id')->contains($admin->id))->toBeTrue();

        $systemMessage = $application->chat->messages()->where('is_system', true)
            ->where('content', 'Открыт спор. В чат добавлен арбитр.')->first();
        expect($systemMessage)->not->toBeNull();

        Event::assertDispatched(ApplicationStatusChanged::class, function ($event) {
            return $event->newStatus === 'disputed';
        });
    });

    test('throws if application cannot be disputed', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = Application::factory()->pending()->create([
            'vacancy_id' => $vacancy->id,
            'user_id' => $executor->id,
            'proposed_price' => 50000,
        ]);

        expect(fn () => $this->service->dispute($application, $client, 'No'))
            ->toThrow(RuntimeException::class, 'Спор можно открыть только для активной сделки.');
    });

    test('throws if dispute already exists', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $admin = User::factory()->create(['is_admin' => true]);

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Hire me',
            'proposed_price' => 50000,
        ]);

        $this->service->accept($application, $client);

        $this->service->dispute($application, $client, 'First dispute');

        expect(fn () => $this->service->dispute($application, $executor, 'Second dispute'))
            ->toThrow(RuntimeException::class, 'Спор можно открыть только для активной сделки.');
    });

    test('creates dispute without admin in system', function () {
        Event::fake();

        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Hire me',
            'proposed_price' => 50000,
        ]);

        $this->service->accept($application, $client);

        $dispute = $this->service->dispute($application, $client, 'No admin');

        expect($dispute->status)->toBe('open')
            ->and($application->refresh()->status)->toBe('disputed');

        expect($application->chat->users)->toHaveCount(2);
    });
});

describe('resolveDispute()', function () {
    test('outcome completed: application completed, executor gets money', function () {
        Event::fake();

        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $admin = User::factory()->create(['is_admin' => true]);

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Hire me',
            'proposed_price' => 50000,
        ]);

        $this->service->accept($application, $client);
        $dispute = $this->service->dispute($application, $client, 'Issue');

        $this->service->resolveDispute($dispute, $admin, 'Work is done', 'completed');

        $application->refresh();
        $executor->refresh();
        $dispute->refresh();

        expect($application->status)->toBe('completed')
            ->and($application->completed_at)->not->toBeNull()
            ->and($executor->balance)->toBe('50000.00')
            ->and($dispute->status)->toBe('resolved')
            ->and($dispute->resolution)->toBe('Work is done')
            ->and($dispute->admin_id)->toBe($admin->id)
            ->and($vacancy->refresh()->status)->toBe('closed')
            ->and($vacancy->post->status)->toBe('closed');

        $transaction = $application->transaction;
        expect($transaction->status)->toBe('completed')
            ->and($transaction->to_user_id)->toBe($executor->id);

        expect($application->chat->users->pluck('id')->contains($admin->id))->toBeFalse();

        Event::assertDispatched(ApplicationStatusChanged::class, function ($event) {
            return $event->newStatus === 'completed';
        });
    });

    test('outcome cancelled: full refund to client', function () {
        Event::fake();

        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $admin = User::factory()->create(['is_admin' => true]);

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Hire me',
            'proposed_price' => 50000,
        ]);

        $this->service->accept($application, $client);
        $dispute = $this->service->dispute($application, $client, 'Issue');

        $this->service->resolveDispute($dispute, $admin, 'Cancel deal', 'cancelled');

        $application->refresh();
        $client->refresh();
        $vacancy->refresh();
        $executor->refresh();

        expect($application->status)->toBe('cancelled')
            ->and($client->balance)->toBe('100000.00')
            ->and($executor->balance)->toBe('0.00')
            ->and($vacancy->status)->toBe('open')
            ->and($application->transaction->status)->toBe('cancelled');

        Event::assertDispatched(ApplicationStatusChanged::class, function ($event) {
            return $event->newStatus === 'cancelled';
        });
    });

    test('outcome cancelled: partial refund splits money', function () {
        Event::fake();

        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $admin = User::factory()->create(['is_admin' => true]);

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Hire me',
            'proposed_price' => 50000,
        ]);

        $this->service->accept($application, $client);
        $dispute = $this->service->dispute($application, $client, 'Issue');

        $this->service->resolveDispute($dispute, $admin, 'Partial work done', 'cancelled', 20000);

        $application->refresh();
        $client->refresh();
        $executor->refresh();

        expect($application->status)->toBe('cancelled')
            ->and($client->balance)->toBe('70000.00')
            ->and($executor->balance)->toBe('30000.00')
            ->and($vacancy->status)->toBe('open')
            ->and($application->transaction->status)->toBe('cancelled');

        $transferTx = Transaction::where('type', 'transfer')
            ->where('application_id', $application->id)
            ->first();
        expect($transferTx)->not->toBeNull()
            ->and($transferTx->amount)->toBe('30000.00')
            ->and($transferTx->to_user_id)->toBe($executor->id)
            ->and($transferTx->status)->toBe('completed');

        Event::assertDispatched(ApplicationStatusChanged::class, function ($event) {
            return $event->newStatus === 'cancelled';
        });
    });

    test('throws if dispute is already resolved', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $admin = User::factory()->create(['is_admin' => true]);

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Hire me',
            'proposed_price' => 50000,
        ]);

        $this->service->accept($application, $client);
        $dispute = $this->service->dispute($application, $client, 'Issue');

        $this->service->resolveDispute($dispute, $admin, 'Done', 'completed');

        expect(fn () => $this->service->resolveDispute($dispute, $admin, 'Again', 'cancelled'))
            ->toThrow(RuntimeException::class, 'Спор уже закрыт.');
    });
});

describe('sendSystemMessage()', function () {
    test('creates system message in chat', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = $this->service->create($vacancy, $executor, [
            'cover_letter' => 'Hire me',
            'proposed_price' => 50000,
        ]);

        $this->service->sendSystemMessage($application, 'Test message');

        $message = $application->chat->messages()->where('is_system', true)
            ->where('content', 'Test message')->first();

        expect($message)->not->toBeNull()
            ->and($message->is_system)->toBeTrue()
            ->and($message->chat_id)->toBe($application->chat->id);
    });

    test('does nothing if application has no chat', function () {
        [$vacancy, $client, $executor] = createVacancyWithClientAndExecutor();

        $application = Application::factory()->create([
            'vacancy_id' => $vacancy->id,
            'user_id' => $executor->id,
        ]);

        expect(fn () => $this->service->sendSystemMessage($application, 'No chat'))
            ->not->toThrow(Exception::class);

        expect(Message::where('content', 'No chat')->exists())->toBeFalse();
    });
});
