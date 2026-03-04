<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * Получить все посты
     */
    public function index()
    {
        $posts = Post::with('user')
            ->latest()
            ->paginate(20);

        return response()->json($posts);
    }

    /**
     * Создать новый пост
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|string',
            'type' => 'nullable|string|in:regular,vacancy',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        $post = Post::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'image' => $request->image,
            'type' => $request->type ?? 'regular',
        ]);

        return response()->json([
            'message' => 'Post created successfully',
            'post' => $post
        ], 201);
    }

    /**
     * Получить конкретный пост
     */
    public function show($id)
    {
        $post = Post::with('user')->findOrFail($id);
        return response()->json($post);
    }

    /**
     * Обновить пост
     */
    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        // Проверка, что пользователь является владельцем поста
        if ($post->user_id !== $request->user()->id) {
            return response()->json([
                'error' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'image' => 'nullable|string',
            'type' => 'nullable|string|in:regular,vacancy',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        $post->update($request->only(['title', 'description', 'image', 'type']));

        return response()->json([
            'message' => 'Post updated successfully',
            'post' => $post
        ]);
    }

    /**
     * Удалить пост
     */
    public function destroy(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        // Проверка, что пользователь является владельцем поста
        if ($post->user_id !== $request->user()->id) {
            return response()->json([
                'error' => 'Unauthorized'
            ], 403);
        }

        $post->delete();

        return response()->json([
            'message' => 'Post deleted successfully'
        ]);
    }
}