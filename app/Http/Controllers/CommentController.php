<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Создать комментарий к посту
     */
    public function store(Request $request, Post $post)
    {
        $validated = $request->validate([
            'text' => 'required|string|max:1000',
        ], [
            'text.required' => 'Текст комментария обязателен.',
            'text.string' => 'Текст должен быть строкой.',
            'text.max' => 'Текст не должен превышать 1000 символов.',
        ]);

        $userId = Auth::id();

        if ($userId === null) {
            return redirect()->route('login')
                ->with('error', 'Необходимо авторизоваться для комментирования.');
        }

        $post->comments()->create([
            'user_id' => $userId,
            'text' => $validated['text'],
        ]);

        return back();
    }

    /**
     * Обновить комментарий
     */
    public function update(Request $request, Comment $comment)
    {
        if ($comment->user_id !== Auth::id()) {
            abort(403, 'Вы можете редактировать только свои комментарии.');
        }

        $validated = $request->validate([
            'text' => 'required|string|max:1000',
        ]);

        $comment->update($validated);

        return back()->with('success', 'Комментарий обновлён.');
    }

    /**
     * Удалить комментарий
     */
    public function destroy(Comment $comment)
    {
        // Удалять могут только автор комментария или автор поста
        if ($comment->user_id !== Auth::id() && $comment->post->user_id !== Auth::id()) {
            abort(403, 'Вы не можете удалить этот комментарий.');
        }

        $comment->delete();

        return back()->with('success', 'Комментарий удалён.');
    }

    /**
     * Пожаловаться на комментарий
     */
    public function report(Request $request, Comment $comment)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        // Проверка, не жаловался ли уже пользователь
        $existingReport = $comment->reports()
            ->where('reporter_id', Auth::id())
            ->first();

        if ($existingReport) {
            return back()->with('error', 'Вы уже отправляли жалобу на этот комментарий.');
        }

        $comment->reports()->create([
            'reporter_id' => Auth::id(),
            'reason' => $validated['reason'],
        ]);

        return back()->with('success', 'Жалоба отправлена.');
    }
}
