<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;

class AdminController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Index');
    }

    public function usersPage()
    {
        return Inertia::render('Admin/Users');
    }

    public function postsPage()
    {
        return Inertia::render('Admin/Posts');
    }

    public function commentsPage()
    {
        return Inertia::render('Admin/Comments');
    }

    public function users()
    {
        $users = User::all();

        return response()->json([
            'users' => $users,
        ]);
    }

    public function posts()
    {
        $posts = Post::with('user')->get();

        return response()->json([
            'posts' => $posts,
        ]);
    }

    public function comments()
    {
        $comments = Comment::with('user', 'post')->get();

        return response()->json([
            'comments' => $comments,
        ]);
    }

    public function deletePost(Post $post)
    {
        $post->delete();
        return redirect()->back();
    }

    public function deleteComment(Comment $comment)
    {
        $comment->delete();
        return redirect()->back();
    }
} 

