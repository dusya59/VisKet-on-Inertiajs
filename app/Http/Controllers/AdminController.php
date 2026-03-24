<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Models\VerificationRejection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $pendingCount = User::where('is_verified', 'pending')->count();

        return Inertia::render('Admin/Index', [
            'pendingVerificationCount' => $pendingCount,
        ]);
    }

    public function usersPage()
    {
        return Inertia::render('Admin/Users');
    }

    public function verificationRequestsPage()
    {
        return Inertia::render('Admin/Users', [
            'mode' => 'verification',
        ]);
    }

    public function postsPage()
    {
        return Inertia::render('Admin/Posts');
    }

    public function commentsPage()
    {
        return Inertia::render('Admin/Comments');
    }

    public function users(Request $request)
    {
        $mode = $request->query('mode');

        if ($mode === 'verification') {
            $users = User::where('is_verified', 'pending')
                ->with('verificationRejections')
                ->get();
        } else {
            $users = User::all();
        }

        return response()->json([
            'users' => $users,
            'mode' => $mode,
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

    public function approveVerification(User $user)
    {
        $user->is_verified = 'verified';
        $user->save();

        return response()->json(['success' => true]);
    }

    public function rejectVerification(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $user->increment('verification_attempts');

        VerificationRejection::create([
            'user_id' => $user->id,
            'reason' => $request->reason,
            'rejected_at' => now(),
        ]);

        return response()->json(['success' => true]);
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
