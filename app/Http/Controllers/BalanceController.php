<?php

namespace App\Http\Controllers;

use App\Models\Payout;
use App\Models\PayoutMethod;
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
            ->with(['fromUser', 'toUser', 'application.vacancy', 'payout'])
            ->orderByDesc('created_at')
            ->paginate(20);

        $payoutMethods = $user->payoutMethods()
            ->orderByDesc('is_default')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Balance/Index', [
            'balance' => (float) $user->balance,
            'pendingTransactions' => $pendingTransactions,
            'transactions' => $allTransactions,
            'payoutMethods' => $payoutMethods,
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

    public function withdraw(Request $request, YooKassaService $yooKassaService)
    {
        Log::info('Withdraw request started', ['data' => $request->all()]);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:100|max:100000',
            'destination_type' => 'required|in:bank_card,sbp',
            'card_number' => 'required_if:destination_type,bank_card|nullable|string|min:13|max:19',
            'phone' => 'required_if:destination_type,sbp|nullable|string|regex:/^7\d{10}$/',
            'bank_id' => 'nullable|string',
            'save_method' => 'boolean',
            'payout_method_id' => 'nullable|exists:payout_methods,id',
        ]);

        $user = auth()->user();
        Log::info('Withdraw validated', ['user_id' => $user->id, 'amount' => $validated['amount']]);

        // Определяем реквизиты
        $type = $validated['destination_type'];
        $method = null;
        $destination = [];
        $masked = '';

        if (! empty($validated['payout_method_id'])) {
            $method = $user->payoutMethods()->where('id', $validated['payout_method_id'])->firstOrFail();
            $type = $method->type;

            if ($type === 'bank_card') {
                $destination = ['type' => 'bank_card', 'card' => ['number' => $method->full_number]];
                $masked = $method->masked_number;
            } else {
                $destination = ['type' => 'sbp', 'phone' => $method->full_number, 'bank_id' => $method->bank_id];
                $masked = $method->masked_number;
            }
        } else {
            if ($type === 'bank_card') {
                $cardNumber = preg_replace('/\D/', '', $validated['card_number']);
                $destination = ['type' => 'bank_card', 'card' => ['number' => $cardNumber]];
                $masked = '•••• ' . substr($cardNumber, -4);
            } else {
                $phone = preg_replace('/\D/', '', $validated['phone']);
                $destination = ['type' => 'sbp', 'phone' => $phone, 'bank_id' => $validated['bank_id'] ?? null];
                $masked = '+7 ••• •••-' . substr($phone, -4, 2) . '-' . substr($phone, -2);
            }
        }

        $payout = null;
        $transaction = null;
        $committed = false;

        DB::beginTransaction();

        try {
            $lockedUser = \App\Models\User::where('id', $user->id)->lockForUpdate()->first();
            Log::info('Withdraw locked user', ['balance' => $lockedUser->balance]);

            if ($lockedUser->balance < $validated['amount']) {
                DB::rollBack();
                Log::warning('Withdraw insufficient funds', ['balance' => $lockedUser->balance, 'amount' => $validated['amount']]);

                return back()->with('error', 'Недостаточно средств на балансе! Максимум: ' . number_format($lockedUser->balance, 0, ',', ' ') . ' ₽');
            }

            $lockedUser->decrement('balance', $validated['amount']);
            Log::info('Withdraw balance decremented', ['new_balance' => $lockedUser->fresh()->balance]);

            $transaction = Transaction::create([
                'from_user_id' => $lockedUser->id,
                'to_user_id' => $lockedUser->id,
                'amount' => $validated['amount'],
                'type' => 'withdrawal',
                'status' => 'pending',
                'description' => 'Вывод средств' . ($masked ? ' (' . $masked . ')' : ''),
            ]);
            Log::info('Withdraw transaction created', ['transaction_id' => $transaction->id]);

            $payout = Payout::create([
                'user_id' => $lockedUser->id,
                'payout_method_id' => $method?->id,
                'transaction_id' => $transaction->id,
                'amount' => $validated['amount'],
                'currency' => 'RUB',
                'status' => 'pending',
                'description' => $transaction->description,
            ]);
            Log::info('Withdraw payout record created', ['payout_id' => $payout->id]);

            DB::commit();
            $committed = true;
            Log::info('Withdraw DB committed');

            // Сохранение нового метода вывода (не критично для транзакции)
            if (empty($validated['payout_method_id']) && ! empty($validated['save_method'])) {
                PayoutMethod::create([
                    'user_id' => $lockedUser->id,
                    'type' => $type,
                    'masked_number' => $masked,
                    'full_number' => $type === 'bank_card' ? preg_replace('/\D/', '', $validated['card_number']) : preg_replace('/\D/', '', $validated['phone']),
                    'bank_id' => $validated['bank_id'] ?? null,
                    'is_default' => $lockedUser->payoutMethods()->count() === 0,
                ]);
                Log::info('Withdraw payout method saved');
            }

            // Вызов API ЮKassa
            Log::info('Withdraw calling YooKassa API', ['destination_type' => $type]);
            $yooPayout = $yooKassaService->createPayout($lockedUser, $validated['amount'], $type, $destination, $method);
            $payout->update(['yookassa_payout_id' => $yooPayout->yookassa_payout_id]);
            Log::info('Withdraw YooKassa API success', ['yookassa_payout_id' => $yooPayout->yookassa_payout_id]);

            return back()->with('success', 'Заявка на вывод создана и обрабатывается.');
        } catch (\Throwable $e) {
            report($e);

            Log::error('Withdraw exception caught', [
                'committed' => $committed,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            if (! $committed) {
                DB::rollBack();
                Log::info('Withdraw rolled back (not committed)');
            } else {
                // Компенсация: возвращаем баланс, отменяем записи
                DB::transaction(function () use ($payout, $transaction) {
                    if ($payout) {
                        $payout->update([
                            'status' => 'canceled',
                            'canceled_at' => now(),
                        ]);
                    }

                    if ($transaction) {
                        $transaction->update(['status' => 'cancelled']);
                    }

                    $refundUser = \App\Models\User::where('id', $payout->user_id)->lockForUpdate()->first();
                    $refundUser->increment('balance', $payout->amount);
                });
                Log::info('Withdraw compensation applied (committed then failed)');
            }

            return back()->withErrors([
                'amount' => 'Ошибка при создании выплаты: ' . $e->getMessage(),
            ]);
        }
    }

    public function sbpBanks(YooKassaService $yooKassaService)
    {
        return response()->json($yooKassaService->getSbpBanks());
    }
}
