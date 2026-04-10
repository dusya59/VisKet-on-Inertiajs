<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Chat;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Vacancy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApplicationController extends Controller
{
    public function respond(Request $request, Vacancy $vacancy)
    {
        $validated = $request->validate([
            'cover_letter' => 'required|string|min:10|max:5000',
            'proposed_price' => 'nullable|numeric|min:0|max:9999999999',
        ]);

        $user = Auth::user();

        $existingApplication = Application::where('vacancy_id', $vacancy->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingApplication) {
            return back()->with('error', 'Вы уже откликнулись на эту вакансию!');
        }

        if ($vacancy->status !== 'open') {
            return back()->with('error', 'Вакансия закрыта!');
        }

        $application = Application::create([
            'vacancy_id' => $vacancy->id,
            'user_id' => $user->id,
            'cover_letter' => $validated['cover_letter'],
            'proposed_price' => $validated['proposed_price'] ?? null,
            'status' => 'pending',
        ]);

        $chat = Chat::create([
            'application_id' => $application->id,
        ]);

        $chat->users()->attach([
            $vacancy->post->user_id,
            $user->id,
        ]);

        return redirect()->route('chat', $chat->id)->with('success', 'Ваш отклик отправлен!');
    }

    public function accept(Application $application)
    {
        $user = Auth::user();

        $vacancy = $application->vacancy;
        if ($vacancy->post->user_id !== $user->id) {
            abort(403);
        }

        $application->update(['status' => 'accepted']);

        return back()->with('success', 'Отклик принят!');
    }

    public function reject(Application $application)
    {
        $user = Auth::user();

        $vacancy = $application->vacancy;
        if ($vacancy->post->user_id !== $user->id) {
            abort(403);
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
        $vacancy = $application->vacancy;

        $chat = $application->chat;

        if (! $chat) {
            $chat = Chat::whereHas('application', function ($q) use ($application) {
                $q->where('id', $application->id);
            })->first();
        }

        if (! $chat) {
            return back()->with('error', 'Чат не найден');
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

        Notification::create([
            'user_id' => $otherUser->id,
            'type' => 'price_proposal',
            'title' => 'Новое предложение цены',
            'content' => "{$user->name} предлагает новую цену. Нажмите на это уведомление чтобы перейти в чат",
            'link' => "/chats/{$chat->id}",
            'is_read' => false,
        ]);

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
