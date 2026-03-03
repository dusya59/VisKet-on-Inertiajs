<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BalanceController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        return Inertia::render('Balance/Index', [
            'balance' => (float) $user->balance,
        ]);
    }

    public function add(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1|max:100000',
        ]);

        $user = auth()->user();
        $user->balance += $validated['amount'];
        $user->save();

        Transaction::create([
            'from_user_id' => null,
            'to_user_id' => $user->id,
            'amount' => $validated['amount'],
            'type' => 'deposit',
            'status' => 'completed',
            'description' => 'Пополнение баланса',
        ]);

        return back()->with('success', 'Баланс успешно пополнен!');
    }

    public function withdraw(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $user = auth()->user();

        if ($user->balance < $validated['amount']) {
            return back()->with('error', 'Недостаточно средств на балансе!');
        }

        $user->balance -= $validated['amount'];
        $user->save();

        Transaction::create([
            'from_user_id' => $user->id,
            'to_user_id' => $user->id,
            'amount' => $validated['amount'],
            'type' => 'withdrawal',
            'status' => 'completed',
            'description' => 'Снятие средств',
        ]);

        return back()->with('success', 'Средства успешно сняты!');
    }
}
