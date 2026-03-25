<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function reportPost(Request $request, Post $post)
    {
        $request->validate([
            'reason' => 'required|string|min:5|max:1000',
        ]);

        $existingReport = Report::where('reporter_id', auth()->id())
            ->where('reported_post_id', $post->id)
            ->where('status', 'pending')
            ->first();

        if ($existingReport) {
            return back()->with('error', 'Вы уже отправляли жалобу на этот пост');
        }

        Report::create([
            'reporter_id' => auth()->id(),
            'reported_post_id' => $post->id,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Жалоба отправлена');
    }
}
