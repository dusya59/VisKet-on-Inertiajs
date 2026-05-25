<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\YooKassaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class BalanceController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $pendingTransactions = Transaction::where('to_user_id', $user->id)
            ->where('status', 'pending')
            ->with(['fromUser', 'application.vacancy'])
            ->orderByDesc('created_at')
            ->get();

        $allTransactions = Transaction::where(function ($query) use ($user) {
            $query->where('from_user_id', $user->id)
                ->orWhere('to_user_id', $user->id);
        })
            ->with(['fromUser', 'toUser', 'application.vacancy'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Balance/Index', [
            'balance' => (float) $user->balance,
            'pendingTransactions' => $pendingTransactions,
            'transactions' => $allTransactions,
        ]);
    }

    public function add(Request $request, YooKassaService $yooKassaService)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1|max:100000',
        ]);

        $user = auth()->user();

        if ($user->is_admin) {
            DB::transaction(function () use ($user, $validated) {
                $lockedUser = \App\Models\User::where('id', $user->id)->lockForUpdate()->first();
                $lockedUser->increment('balance', $validated['amount']);

                Transaction::create([
                    'from_user_id' => null,
                    'to_user_id' => $lockedUser->id,
                    'amount' => $validated['amount'],
                    'type' => 'deposit',
                    'status' => 'completed',
                    'description' => 'Пополнение баланса (админ)',
                ]);

                Log::info('Admin balance deposit', [
                    'admin_id' => $lockedUser->id,
                    'amount' => $validated['amount'],
                    'new_balance' => $lockedUser->fresh()->balance,
                ]);
            });

            return back()->with('success', 'Баланс успешно пополнен!');
        }

        $payment = $yooKassaService->createPayment($user, $validated['amount']);

        return Inertia::location($payment->confirmation_url);
    }

    public function withdraw(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $user = auth()->user();

        $result = DB::transaction(function () use ($user, $validated) {
            $lockedUser = \App\Models\User::where('id', $user->id)->lockForUpdate()->first();

            if ($lockedUser->balance < $validated['amount']) {
                return false;
            }

            $lockedUser->decrement('balance', $validated['amount']);

            Transaction::create([
                'from_user_id' => $lockedUser->id,
                'to_user_id' => $lockedUser->id,
                'amount' => $validated['amount'],
                'type' => 'withdrawal',
                'status' => 'completed',
                'description' => 'Снятие средств',
            ]);

            Log::info('Balance withdrawal', [
                'user_id' => $lockedUser->id,
                'amount' => $validated['amount'],
                'new_balance' => $lockedUser->fresh()->balance,
            ]);

            return true;
        });

        if (!$result) {
            return back()->with('error', 'Недостаточно средств на балансе!');
        }

        return back()->with('success', 'Средства успешно сняты!');
    }
}
