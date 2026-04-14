<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Dispute;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DisputeController extends Controller
{
    public function index()
    {
        $disputes = Dispute::with(['application', 'application.vacancy', 'initiator', 'admin'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Disputes/Index', [
            'disputes' => $disputes,
        ]);
    }

    public function show(Dispute $dispute)
    {
        $dispute->load(['application', 'application.vacancy', 'application.vacancy.post', 'initiator', 'admin', 'chat']);

        return Inertia::render('Disputes/Show', [
            'dispute' => $dispute,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'application_id' => 'required|exists:applications,id',
            'reason' => 'required|string|min:10|max:5000',
        ]);

        $user = Auth::user();

        $application = Application::with('vacancy')->findOrFail($validated['application_id']);

        $chat = $application->chat;
        if (! $chat) {
            return back()->with('error', 'Чат не найден!');
        }

        $isParticipant = $chat->users()->where('user_id', $user->id)->exists();
        if (! $isParticipant) {
            abort(403);
        }

        if ($application->status !== 'accepted') {
            return back()->with('error', 'Спор можно открыть только для принятых откликов!');
        }

        if ($application->hasDispute()) {
            return back()->with('error', 'Спор по этому отклику уже открыт!');
        }

        $existingDispute = Dispute::where('application_id', $application->id)
            ->where('status', 'open')
            ->first();

        if ($existingDispute) {
            return back()->with('error', 'Спор уже существует!');
        }

        $dispute = Dispute::create([
            'application_id' => $application->id,
            'initiator_id' => $user->id,
            'reason' => $validated['reason'],
            'status' => 'open',
        ]);

        Notification::create([
            'user_id' => $application->user_id,
            'type' => 'dispute_opened',
            'title' => 'Открыт спор',
            'content' => "Пользователь {$user->name} открыл спор по вакансии \"{$application->vacancy->position}\". Ожидайте решения администратора.",
            'link' => "/chats/{$chat->id}",
            'is_read' => false,
        ]);

        $vacancyAuthor = $application->vacancy->post->user;
        if ($vacancyAuthor->id !== $user->id) {
            Notification::create([
                'user_id' => $vacancyAuthor->id,
                'type' => 'dispute_opened',
                'title' => 'Открыт спор',
                'content' => "Пользователь {$user->name} открыл спор по вашей вакансии \"{$application->vacancy->position}\". Ожидайте решения администратора.",
                'link' => "/chats/{$chat->id}",
                'is_read' => false,
            ]);
        }

        return redirect()->back()->with('success', 'Спор открыт! Администратор рассмотрит вашу заявку.');
    }

    public function take(Dispute $dispute)
    {
        $user = Auth::user();

        if (! $user->is_admin) {
            abort(403);
        }

        if ($dispute->status !== 'open') {
            return back()->with('error', 'Спор нельзя принять!');
        }

        if ($dispute->admin_id) {
            return back()->with('error', 'Спор уже принят другим администратором!');
        }

        $chat = $dispute->application->chat;

        $chat->users()->attach($user->id);

        $dispute->update([
            'admin_id' => $user->id,
            'chat_id' => $chat->id,
        ]);

        Notification::create([
            'user_id' => $dispute->initiator_id,
            'type' => 'dispute_taken',
            'title' => 'Администратор взял спор',
            'content' => "Администратор {$user->name} взял ваш спор в работу. Скоро с вами свяжутся.",
            'link' => "/chats/{$chat->id}",
            'is_read' => false,
        ]);

        return redirect()->back()->with('success', 'Вы взяли спор в работу!');
    }

    public function resolve(Request $request, Dispute $dispute)
    {
        $validated = $request->validate([
            'resolution' => 'required|string|min:10|max:5000',
        ]);

        $user = Auth::user();

        if (! $user->is_admin) {
            abort(403);
        }

        if ($dispute->status !== 'open') {
            return back()->with('error', 'Спор уже закрыт!');
        }

        $transaction = $dispute->application->transaction;

        $dispute->update([
            'status' => 'resolved',
            'resolution' => $validated['resolution'],
        ]);

        if ($transaction && $transaction->status === 'pending') {
            $transaction->update(['status' => 'completed']);

            $worker = $transaction->toUser();
            $worker->balance += $transaction->amount;
            $worker->save();
        }

        Notification::create([
            'user_id' => $dispute->initiator_id,
            'type' => 'dispute_resolved',
            'title' => 'Спор решён',
            'content' => "Администратор решил спор: {$validated['resolution']}",
            'link' => "/chats/{$dispute->chat_id}",
            'is_read' => false,
        ]);

        $application = $dispute->application;
        $otherUserId = $application->user_id === $dispute->initiator_id
            ? $application->vacancy->post->user_id
            : $application->user_id;

        Notification::create([
            'user_id' => $otherUserId,
            'type' => 'dispute_resolved',
            'title' => 'Спор решён',
            'content' => "Администратор решил спор: {$validated['resolution']}",
            'link' => "/chats/{$dispute->chat_id}",
            'is_read' => false,
        ]);

        return redirect()->route('admin.disputes.index')->with('success', 'Спор решён!');
    }

    public function cancel(Dispute $dispute)
    {
        $user = Auth::user();

        if ($dispute->initiator_id !== $user->id && ! $user->is_admin) {
            abort(403);
        }

        if ($dispute->status !== 'open') {
            return back()->with('error', 'Спор уже закрыт!');
        }

        $dispute->update(['status' => 'cancelled']);

        return redirect()->back()->with('success', 'Спор отменён!');
    }
}
