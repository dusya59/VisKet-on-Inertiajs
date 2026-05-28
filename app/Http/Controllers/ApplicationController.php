<?php

namespace App\Http\Controllers;

use App\Http\Requests\AcceptApplicationRequest;
use App\Http\Requests\CancelApplicationRequest;
use App\Http\Requests\CompleteByClientRequest;
use App\Http\Requests\MarkCompletedRequest;
use App\Http\Requests\StoreApplicationRequest;
use App\Models\Application;
use App\Models\Chat;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Vacancy;
use App\Services\ApplicationLifecycleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApplicationController extends Controller
{
    public function __construct(
        private ApplicationLifecycleService $lifecycle
    ) {}

    public function respond(StoreApplicationRequest $request, Vacancy $vacancy)
    {
        $user = Auth::user();

        if ($vacancy->status !== 'open') {
            return back()->with('error', 'Вакансия закрыта!');
        }

        if ($vacancy->post->user_id === $user->id) {
            return back()->with('error', 'Нельзя откликнуться на свою вакансию.');
        }

        try {
            $application = $this->lifecycle->create($vacancy, $user, $request->validated());
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->route('chat', $application->chat)->with('success', 'Ваш отклик отправлен!');
    }

    public function accept(AcceptApplicationRequest $request, Application $application)
    {
        $this->authorize('accept', $application);

        try {
            $this->lifecycle->accept($application, Auth::user());
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Отклик принят! Средства заморожены, сделка началась.');
    }

    public function markCompleted(MarkCompletedRequest $request, Application $application)
    {
        $this->authorize('markDone', $application);

        try {
            $this->lifecycle->markDoneByExecutor($application, Auth::user());
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Работа отмечена как выполненная. Ожидайте подтверждения заказчика.');
    }

    public function confirmCompletion(CompleteByClientRequest $request, Application $application)
    {
        $this->authorize('complete', $application);

        try {
            $this->lifecycle->completeByClient($application, Auth::user());
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Сделка завершена! Средства переведены исполнителю.');
    }

    public function cancel(CancelApplicationRequest $request, Application $application)
    {
        $this->authorize('cancel', $application);

        try {
            $this->lifecycle->requestCancel($application, Auth::user(), $request->input('reason'));
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Сделка отменена. Средства возвращены.');
    }

    public function withdraw(Application $application)
    {
        $user = Auth::user();

        $vacancy = $application->vacancy;
        if ($vacancy->post->user_id !== $user->id) {
            abort(403);
        }

        if (! in_array($application->status, ['accepted', 'in_progress'], true)) {
            return back()->with('error', 'Невозможно отменить этот отклик!');
        }

        try {
            $this->lifecycle->requestCancel($application, $user, 'Отменено заказчиком (устаревший метод).');
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Отклик отменён. Средства возвращены на ваш баланс.');
    }

    public function closeVacancy(Application $application)
    {
        $user = Auth::user();

        $vacancy = $application->vacancy;
        if ($vacancy->post->user_id !== $user->id) {
            abort(403);
        }

        if (! in_array($application->status, ['in_progress', 'accepted'], true)) {
            return back()->with('error', 'Невозможно закрыть вакансию!');
        }

        $vacancy->post->update([
            'status' => 'closed',
            'active' => false,
        ]);

        return back()->with('success', 'Вакансия закрыта!');
    }

    public function reject(Application $application)
    {
        $user = Auth::user();

        $vacancy = $application->vacancy;
        if ($vacancy->post->user_id !== $user->id) {
            abort(403);
        }

        if (! $application->isPending()) {
            return back()->with('error', 'Невозможно отклонить этот отклик!');
        }

        $application->update(['status' => 'rejected']);

        return back()->with('success', 'Отклик отклонён!');
    }

    public function proposePrice(Request $request, Application $application)
    {
        $validated = $request->validate([
            'proposed_price' => 'required|numeric|min:0|max:9999999999',
        ]);

        $user = Auth::user();
        $chat = $application->chat;

        if (! $chat) {
            return back()->with('error', 'Чат не найден');
        }

        $isParticipant = $chat->users()->where('user_id', $user->id)->exists();
        if (! $isParticipant) {
            abort(403);
        }

        $otherUser = $chat->users()->where('user_id', '!=', $user->id)->first();

        $message = Message::create([
            'chat_id' => $chat->id,
            'user_id' => $user->id,
            'content' => "Предлагаю новую цену: {$validated['proposed_price']} ₽",
            'is_price_proposal' => true,
            'proposed_price' => $validated['proposed_price'],
            'price_proposal_status' => 'pending',
        ]);

        if ($otherUser) {
            Notification::create([
                'user_id' => $otherUser->id,
                'type' => 'price_proposal',
                'title' => 'Новое предложение цены',
                'content' => "{$user->name} предлагает новую цену. Нажмите на это уведомление чтобы перейти в чат",
                'link' => "/chats/{$chat->id}",
                'is_read' => false,
            ]);
        }

        return back()->with('success', 'Предложение отправлено!');
    }

    public function acceptPriceProposal(Message $message)
    {
        $user = Auth::user();

        if ($message->price_proposal_status !== 'pending') {
            abort(400, 'Предложение уже обработано');
        }

        $chat = $message->chat;
        $isParticipant = $chat->users()->where('user_id', $user->id)->exists();

        if (! $isParticipant) {
            abort(403);
        }

        $application = $chat->application;
        $application->update(['proposed_price' => $message->proposed_price]);

        $message->update(['price_proposal_status' => 'accepted']);

        $proposer = $message->user;
        Notification::create([
            'user_id' => $proposer->id,
            'type' => 'price_proposal_accepted',
            'title' => 'Цена принята',
            'content' => "{$user->name} принял ваше предложение цены {$message->proposed_price} ₽",
            'link' => "/chats/{$chat->id}",
            'is_read' => false,
        ]);

        return back()->with('success', 'Цена принята!');
    }

    public function respondToPriceProposal(Message $message)
    {
        return redirect()->route('chat', $message->chat_id);
    }
}
