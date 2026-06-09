<?php

namespace App\Services;

use App\Events\ApplicationStatusChanged;
use App\Events\MessageSent;
use App\Models\Application;
use App\Models\Chat;
use App\Models\Dispute;
use App\Models\Message;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ApplicationLifecycleService
{
    public function create(Vacancy $vacancy, User $user, array $data): Application
    {
        return DB::transaction(function () use ($vacancy, $user, $data) {
            $existing = Application::where('vacancy_id', $vacancy->id)
                ->where('user_id', $user->id)
                ->whereIn('status', ['pending', 'accepted', 'in_progress', 'disputed'])
                ->first();

            if ($existing) {
                throw new \RuntimeException('У вас уже есть активная заявка на эту вакансию.');
            }

            $application = Application::create([
                'vacancy_id' => $vacancy->id,
                'user_id' => $user->id,
                'cover_letter' => $data['cover_letter'],
                'proposed_price' => $data['proposed_price'] ?? null,
                'status' => 'pending',
            ]);

            $chat = Chat::create(['application_id' => $application->id]);
            $chat->users()->attach([
                $vacancy->post->user_id,
                $user->id,
            ]);

            return $application;
        });
    }

    public function accept(Application $application, User $client): void
    {
        DB::transaction(function () use ($application, $client) {
            $lockedApplication = Application::where('id', $application->id)->lockForUpdate()->first();

            if (! $lockedApplication->canBeAccepted()) {
                throw new \RuntimeException('Заявку нельзя принять.');
            }

            $price = $lockedApplication->proposed_price;
            if (! $price || $price <= 0) {
                throw new \RuntimeException('Укажите корректную сумму для оплаты.');
            }

            $lockedClient = User::where('id', $client->id)->lockForUpdate()->first();

            if ($lockedClient->balance < $price) {
                throw new \RuntimeException('Недостаточно средств на балансе.');
            }

            $lockedClient->decrement('balance', $price);

            $lockedApplication->update([
                'status' => 'in_progress',
                'accepted_at' => now(),
                'in_progress_at' => now(),
            ]);

            Transaction::create([
                'from_user_id' => $lockedClient->id,
                'amount' => $price,
                'type' => 'payment',
                'status' => 'pending',
                'description' => "Оплата за вакансию: {$lockedApplication->vacancy->position}",
                'application_id' => $lockedApplication->id,
            ]);

            $lockedApplication->vacancy->update(['status' => 'in_progress']);

            $this->sendSystemMessage(
                $lockedApplication,
                'Сделка началась, средства заморожены.'
            );

            event(new ApplicationStatusChanged($lockedApplication, 'in_progress', $client));

            Log::info('Application accepted', [
                'application_id' => $lockedApplication->id,
                'client_id' => $lockedClient->id,
                'price' => $price,
            ]);

        $application->refresh();
        });
    }

    public function markDoneByExecutor(Application $application, User $executor): void
    {
        DB::transaction(function () use ($application, $executor) {
            if (! $application->canBeMarkedDoneByExecutor()) {
                throw new \RuntimeException('Невозможно отметить работу как выполненную.');
            }

            $application->update([
                'executor_marked_completed_at' => now(),
            ]);

            $this->sendSystemMessage(
                $application,
                'Исполнитель отметил работу как выполненную. Ожидается подтверждение заказчика.'
            );

            event(new ApplicationStatusChanged($application, 'executor_marked_done', $executor));
        });
    }

    public function completeByClient(Application $application, User $client): void
    {
        DB::transaction(function () use ($application, $client) {
            if (! $application->canBeCompletedByClient()) {
                throw new \RuntimeException('Невозможно подтвердить завершение.');
            }

            $application->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            $transaction = $application->transaction;
            if ($transaction && $transaction->status === 'pending') {
                $transaction->update([
                    'status' => 'completed',
                    'to_user_id' => $application->user_id,
                    'completed_at' => now(),
                ]);

                $executor = User::where('id', $application->user_id)->lockForUpdate()->first();
                $executor->increment('balance', $transaction->amount);
            }

            $application->vacancy->post->update([
                'status' => 'closed',
                'active' => false,
            ]);

            $application->vacancy->update(['status' => 'closed']);

            $this->sendSystemMessage(
                $application,
                'Сделка завершена.'
            );

            event(new ApplicationStatusChanged($application, 'completed', $client));
        });
    }

    public function requestCancel(Application $application, User $initiator, string $reason): void
    {
        DB::transaction(function () use ($application, $initiator, $reason) {
            if (! $application->canBeCancelled()) {
                throw new \RuntimeException('Отмена невозможна в текущем статусе.');
            }

            $other = $application->otherParty($initiator);
            if (! $other) {
                throw new \RuntimeException('Не удалось определить контрагента.');
            }

            $application->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);

            $transaction = $application->transaction;
            if ($transaction && in_array($transaction->status, ['pending', 'completed'], true)) {
                $transaction->update(['status' => 'cancelled']);

                if ($transaction->from_user_id) {
                    $client = User::where('id', $transaction->from_user_id)->lockForUpdate()->first();
                    if ($client) {
                        $client->increment('balance', $transaction->amount);
                    }
                }
            }

            $application->vacancy->update(['status' => 'open']);

            $this->sendSystemMessage(
                $application,
                "Сделка отменена. Причина: {$reason}"
            );

            event(new ApplicationStatusChanged($application, 'cancelled', $initiator));
        });
    }

    public function dispute(Application $application, User $initiator, string $reason): Dispute
    {
        return DB::transaction(function () use ($application, $initiator, $reason) {
            if (! $application->canBeDisputed()) {
                throw new \RuntimeException('Спор можно открыть только для активной сделки.');
            }

            if ($application->hasDispute()) {
                throw new \RuntimeException('Спор по этой заявке уже открыт.');
            }

            $application->update([
                'status' => 'disputed',
                'disputed_at' => now(),
            ]);

            $chat = $application->chat;

            $dispute = Dispute::create([
                'application_id' => $application->id,
                'initiator_id' => $initiator->id,
                'reason' => $reason,
                'status' => 'open',
                'chat_id' => $chat?->id,
            ]);

            $admin = User::where('is_admin', true)->first();
            if ($admin && $chat) {
                $chat->users()->syncWithoutDetaching([$admin->id]);
            }

            $this->sendSystemMessage(
                $application,
                'Открыт спор. В чат добавлен арбитр.'
            );

            event(new ApplicationStatusChanged($application, 'disputed', $initiator));

            return $dispute;
        });
    }

    public function resolveDispute(Dispute $dispute, User $admin, string $resolution, string $outcome, ?float $refundAmount = null): void
    {
        DB::transaction(function () use ($dispute, $admin, $resolution, $outcome, $refundAmount) {
            if ($dispute->status !== 'open') {
                throw new \RuntimeException('Спор уже закрыт.');
            }

            $application = $dispute->application;
            $transaction = $application->transaction;
            $total = $transaction?->amount ?? 0;

            $dispute->update([
                'status' => 'resolved',
                'resolution' => $resolution,
                'admin_id' => $admin->id,
            ]);

            if ($outcome === 'completed') {
                $application->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                ]);

                if ($transaction && $transaction->status === 'pending') {
                    $transaction->update([
                        'status' => 'completed',
                        'to_user_id' => $application->user_id,
                        'completed_at' => now(),
                    ]);

                    $executor = User::where('id', $application->user_id)->lockForUpdate()->first();
                    $executor->increment('balance', $transaction->amount);
                }

                $application->vacancy->post->update([
                    'status' => 'closed',
                    'active' => false,
                ]);
                $application->vacancy->update(['status' => 'closed']);
            } elseif ($outcome === 'cancelled') {
                $application->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                ]);

                if ($transaction && $transaction->status === 'pending') {
                    if ($refundAmount && $refundAmount > 0 && $refundAmount < $total) {
                        $transaction->update(['status' => 'cancelled']);

                        $client = User::where('id', $transaction->from_user_id)->lockForUpdate()->first();
                        $executor = User::where('id', $application->user_id)->lockForUpdate()->first();

                        if ($client) {
                            $client->increment('balance', $refundAmount);
                        }

                        $executorPart = $total - $refundAmount;
                        if ($executorPart > 0 && $executor) {
                            $executor->increment('balance', $executorPart);

                            Transaction::create([
                                'from_user_id' => null,
                                'to_user_id' => $executor->id,
                                'amount' => $executorPart,
                                'type' => 'transfer',
                                'status' => 'completed',
                                'description' => "Частичная оплата по спору: {$application->vacancy->position}",
                                'application_id' => $application->id,
                                'completed_at' => now(),
                            ]);
                        }
                    } else {
                        $transaction->update(['status' => 'cancelled']);

                        $client = User::where('id', $transaction->from_user_id)->lockForUpdate()->first();
                        if ($client) {
                            $client->increment('balance', $transaction->amount);
                        }
                    }
                }

                $application->vacancy->update(['status' => 'open']);
            }

            $chat = $application->chat;
            if ($chat) {
                $chat->users()->detach($admin->id);
            }

            $this->sendSystemMessage(
                $application,
                "Спор разрешён. Решение: {$resolution}"
            );

            event(new ApplicationStatusChanged($application, $outcome, $admin));
        });
    }

    public function sendSystemMessage(Application $application, string $content): void
    {
        $chat = $application->chat;
        if (! $chat) {
            return;
        }

        $user = $application->vacancy->post->user;

        $message = Message::create([
            'chat_id' => $chat->id,
            'user_id' => $user->id,
            'content' => $content,
            'is_system' => true,
        ]);

        event(new MessageSent($user, $message));
    }
}
