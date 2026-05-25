<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResolveDisputeRequest;
use App\Http\Requests\StoreDisputeRequest;
use App\Models\Dispute;
use App\Services\ApplicationLifecycleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DisputeController extends Controller
{
    public function __construct(
        private ApplicationLifecycleService $lifecycle
    ) {}

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

    public function store(StoreDisputeRequest $request)
    {
        $user = Auth::user();
        $application = \App\Models\Application::with('vacancy')->findOrFail($request->input('application_id'));

        $this->authorize('dispute', $application);

        try {
            $this->lifecycle->dispute($application, $user, $request->input('reason'));
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Спор открыт! Администратор рассмотрит вашу заявку.');
    }

    public function take(Dispute $dispute)
    {
        $this->authorize('take', $dispute);

        $user = Auth::user();
        $chat = $dispute->application->chat;

        if ($chat) {
            $chat->users()->syncWithoutDetaching([$user->id]);
        }

        $dispute->update([
            'admin_id' => $user->id,
            'chat_id' => $chat?->id,
        ]);

        Log::info('Dispute taken by admin', [
            'dispute_id' => $dispute->id,
            'admin_id' => $user->id,
        ]);

        \App\Models\Notification::create([
            'user_id' => $dispute->initiator_id,
            'type' => 'dispute_taken',
            'title' => 'Администратор взял спор',
            'content' => "Администратор {$user->name} взял ваш спор в работу. Скоро с вами свяжутся.",
            'link' => "/chats/{$chat->id}",
            'is_read' => false,
        ]);

        return redirect()->back()->with('success', 'Вы взяли спор в работу!');
    }

    public function resolve(ResolveDisputeRequest $request, Dispute $dispute)
    {
        $this->authorize('resolve', $dispute);

        try {
            $this->lifecycle->resolveDispute(
                $dispute,
                Auth::user(),
                $request->input('resolution'),
                $request->input('outcome'),
                $request->input('refund_amount')
            );

            Log::info('Dispute resolved', [
                'dispute_id' => $dispute->id,
                'admin_id' => Auth::id(),
                'outcome' => $request->input('outcome'),
                'refund_amount' => $request->input('refund_amount'),
            ]);
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->route('admin.disputes.index')->with('success', 'Спор решён!');
    }

    public function cancel(Dispute $dispute)
    {
        $this->authorize('cancel', $dispute);

        if ($dispute->status !== 'open') {
            return back()->with('error', 'Спор уже закрыт!');
        }

        $dispute->update(['status' => 'cancelled']);

        return redirect()->back()->with('success', 'Спор отменён!');
    }
}
