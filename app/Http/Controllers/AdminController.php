<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Notification;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use App\Models\VerificationRejection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $pendingCount = User::where('is_verified', 'pending')->count();

        $usersReportCount = Report::whereNotNull('reported_user_id')
            ->where('status', 'pending')
            ->distinct('reported_user_id')
            ->count('reported_user_id');

        $postsReportCount = Report::whereNotNull('reported_post_id')
            ->where('status', 'pending')
            ->distinct('reported_post_id')
            ->count('reported_post_id');

        $commentsReportCount = Report::whereNotNull('reported_comment_id')
            ->where('status', 'pending')
            ->distinct('reported_comment_id')
            ->count('reported_comment_id');

        return Inertia::render('Admin/Index', [
            'pendingVerificationCount' => $pendingCount,
            'usersReportCount' => $usersReportCount,
            'postsReportCount' => $postsReportCount,
            'commentsReportCount' => $commentsReportCount,
        ]);
    }

    public function usersPage(Request $request)
    {
        return Inertia::render('Admin/Users', [
            'mode' => $request->query('mode', 'users'),
        ]);
    }

    public function verificationRequestsPage()
    {
        return Inertia::render('Admin/Users', [
            'mode' => 'verification',
        ]);
    }

    public function postsPage(Request $request)
    {
        return Inertia::render('Admin/Posts', [
            'mode' => $request->query('mode', 'posts'),
        ]);
    }

    public function commentsPage(Request $request)
    {
        return Inertia::render('Admin/Comments', [
            'mode' => $request->query('mode', 'comments'),
        ]);
    }

    public function users(Request $request)
    {
        $mode = $request->query('mode');

        if ($mode === 'verification') {
            $users = User::where('is_verified', 'pending')
                ->with('verificationRejections')
                ->get();
        } elseif ($mode === 'reports') {
            $reportedUserIds = Report::whereNotNull('reported_user_id')
                ->where('status', 'pending')
                ->distinct()
                ->pluck('reported_user_id');

            $users = User::whereIn('id', $reportedUserIds)
                ->with(['reports' => function ($query) {
                    $query->where('status', 'pending')
                        ->whereNotNull('reported_user_id')
                        ->with('reporter');
                }])
                ->get();
        } else {
            $users = User::all();
        }

        return response()->json([
            'users' => $users,
            'mode' => $mode,
        ]);
    }

    public function posts(Request $request)
    {
        $mode = $request->query('mode');

        if ($mode === 'reports') {
            $reportedPostIds = Report::whereNotNull('reported_post_id')
                ->where('status', 'pending')
                ->distinct()
                ->pluck('reported_post_id');

            $posts = Post::whereIn('id', $reportedPostIds)
                ->with(['user', 'reports' => function ($query) {
                    $query->where('status', 'pending')
                        ->whereNotNull('reported_post_id')
                        ->with('reporter');
                }])
                ->get();
        } else {
            $posts = Post::with('user')->get();
        }

        return response()->json([
            'posts' => $posts,
            'mode' => $mode,
        ]);
    }

    public function comments(Request $request)
    {
        $mode = $request->query('mode');

        if ($mode === 'reports') {
            $reportedCommentIds = Report::whereNotNull('reported_comment_id')
                ->where('status', 'pending')
                ->distinct()
                ->pluck('reported_comment_id');

            $comments = Comment::whereIn('id', $reportedCommentIds)
                ->with(['user', 'post', 'reports' => function ($query) {
                    $query->where('status', 'pending')
                        ->whereNotNull('reported_comment_id')
                        ->with('reporter');
                }])
                ->get();
        } else {
            $comments = Comment::with('user', 'post')->get();
        }

        return response()->json([
            'comments' => $comments,
            'mode' => $mode,
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

    public function dismissReport(Request $request, Report $report)
    {
        $report->status = 'dismissed';
        $report->save();

        return response()->json(['success' => true]);
    }

    public function resolveReport(Request $request, Report $report)
    {
        $report->status = 'resolved';
        $report->save();

        return response()->json(['success' => true]);
    }

    public function dismissUserReports(User $user)
    {
        Report::where('reported_user_id', $user->id)
            ->where('status', 'pending')
            ->update(['status' => 'dismissed']);

        return response()->json(['success' => true]);
    }

    public function dismissPostReports(Post $post)
    {
        Report::where('reported_post_id', $post->id)
            ->where('status', 'pending')
            ->update(['status' => 'dismissed']);

        return response()->json(['success' => true]);
    }

    public function dismissCommentReports(Comment $comment)
    {
        Report::where('reported_comment_id', $comment->id)
            ->where('status', 'pending')
            ->update(['status' => 'dismissed']);

        return response()->json(['success' => true]);
    }

    public function deleteUser(User $user)
    {
        Report::where('reported_user_id', $user->id)
            ->where('status', 'pending')
            ->update(['status' => 'resolved']);

        $user->delete();

        return response()->json(['success' => true]);
    }

    public function warnPost(Post $post)
    {
        Notification::create([
            'user_id' => $post->user_id,
            'type' => 'post_warning',
            'title' => 'Предупреждение о публикации',
            'content' => 'Ваш пост получил жалобу. Если вы получите еще 2 предупреждения, нам придется скрыть ваш пост без возможности восстановления.',
            'link' => route('posts.show', $post->id),
            'is_read' => false,
        ]);

        Report::where('reported_post_id', $post->id)
            ->where('status', 'pending')
            ->update(['status' => 'resolved']);

        return response()->json(['success' => true]);
    }

    public function hidePost(Post $post)
    {
        $post->active = false;
        $post->save();

        Notification::create([
            'user_id' => $post->user_id,
            'type' => 'post_hidden',
            'title' => 'Пост скрыт',
            'content' => 'Ваш пост "'.$post->title.'" был скрыт администрацией.',
            'link' => route('posts.show', $post->id),
            'is_read' => false,
        ]);

        Report::where('reported_post_id', $post->id)
            ->where('status', 'pending')
            ->update(['status' => 'resolved']);

        return response()->json(['success' => true]);
    }
}
