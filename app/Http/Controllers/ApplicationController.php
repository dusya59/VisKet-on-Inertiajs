<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Chat;
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
}
