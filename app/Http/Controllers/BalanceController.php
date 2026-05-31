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
    public function index(YooKassaService $yooKassaService)
    {
        $user = auth()->user();

        $pendingTransactions = Transaction::where('to_user_id', $user->id)
            ->where('status', 'pending')
            ->whereNotIn('type', ['withdrawal', 'deposit'])
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

        // Синхронизация статусов pending payouts с YooKassa
        foreach ($allTransactions->items() as $tx) {
            if ($tx->type === 'withdrawal' && $tx->status === 'pending' && $tx->payout && $tx->payout->yookassa_payout_id) {
                try {
                    $info = $yooKassaService->getPayoutInfo($tx->payout->yookassa_payout_id);
                    $status = $info->getStatus();

                    if ($status === 'succeeded' && $tx->payout->isPending()) {
                        DB::transaction(function () use ($tx) {
                            $payout = \App\Models\Payout::where('id', $tx->payout->id)->lockForUpdate()->first();
                            if ($payout->isPending()) {
                                $payout->update([
                                    'status' => 'succeeded',
                                    'succeeded_at' => now(),
                                ]);
                                $tx->update(['status' => 'completed']);
                            }
                        });
                    } elseif ($status === 'canceled' && $tx->payout->isPending()) {
                        DB::transaction(function () use ($tx) {
                            $payout = \App\Models\Payout::where('id', $tx->payout->id)->lockForUpdate()->first();
                            if ($payout->isPending()) {
                                $payout->update([
                                    'status' => 'canceled',
                                    'canceled_at' => now(),
                                ]);
                                $tx->update(['status' => 'cancelled']);
                                $payout->user->increment('balance', $payout->amount);
                            }
                        });
                    }
                } catch (\Throwable $e) {
                    Log::warning('Failed to sync payout status in index', [
                        'payout_id' => $tx->payout->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        // Перезагружаем транзакции после синхронизации
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

    public function destroyPayoutMethod($id)
    {
        $user = auth()->user();
        $method = $user->payoutMethods()->where('id', $id)->firstOrFail();

        if ($method->is_default) {
            $nextMethod = $user->payoutMethods()->where('id', '!=', $id)->orderByDesc('created_at')->first();
            if ($nextMethod) {
                $nextMethod->update(['is_default' => true]);
            }
        }

        $method->delete();

        return back()->with('success', 'Сохранённый способ вывода удалён.');
    }

    private function mapYooKassaError(string $message): string
    {
        if (str_contains($message, 'Error code: invalid_request') && str_contains($message, 'card.number')) {
            return 'Неверный номер банковской карты. Проверьте правильность ввода.';
        }

        if (str_contains($message, 'Error code: invalid_credentials')) {
            return 'Ошибка авторизации в платёжной системе. Обратитесь в поддержку.';
        }

        if (str_contains($message, 'Error code: forbidden')) {
            return 'Выплаты не подключены для этого магазина. Обратитесь в поддержку.';
        }

        if (str_contains($message, 'Error code: not_found')) {
            return 'Реквизиты получателя не найдены. Проверьте данные и попробуйте снова.';
        }

        if (str_contains($message, 'Error code: insufficient_funds')) {
            return 'Недостаточно средств на счёте для выполнения выплаты. Обратитесь в поддержку.';
        }

        if (str_contains($message, 'Error code: too_many_requests')) {
            return 'Слишком много запросов. Подождите минуту и попробуйте снова.';
        }

        if (str_contains($message, 'Error code: internal_server_error')) {
            return 'Временная ошибка платёжной системы. Попробуйте позже.';
        }

        if (str_contains($message, 'Error code: idempotency_key_reuse')) {
            return 'Дублирующий запрос. Проверьте статус операции в истории.';
        }

        return 'Ошибка при создании выплаты: ' . $message;
    }

    public function withdraw(Request $request, YooKassaService $yooKassaService)
    {
        Log::info('Withdraw request started', ['data' => $request->all()]);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:100|max:100000',
            'card_number' => 'nullable|string|min:13|max:19',
            'save_method' => 'boolean',
            'payout_method_id' => 'nullable|exists:payout_methods,id',
        ]);

        $user = auth()->user();
        Log::info('Withdraw validated', ['user_id' => $user->id, 'amount' => $validated['amount']]);

        // Ручная валидация реквизитов (если не выбран сохранённый метод)
        if (empty($validated['payout_method_id']) && empty($validated['card_number'])) {
            return back()->withErrors(['card_number' => 'Введите номер банковской карты']);
        }

        // Определяем реквизиты
        $method = null;
        $destination = [];
        $masked = '';

        if (! empty($validated['payout_method_id'])) {
            $method = $user->payoutMethods()->where('id', $validated['payout_method_id'])->firstOrFail();
            $destination = ['type' => 'bank_card', 'card' => ['number' => $method->full_number]];
            $masked = $method->masked_number;
        } else {
            $cardNumber = preg_replace('/\D/', '', $validated['card_number']);
            $destination = ['type' => 'bank_card', 'card' => ['number' => $cardNumber]];
            $masked = '•••• ' . substr($cardNumber, -4);
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
                    'type' => 'bank_card',
                    'masked_number' => $masked,
                    'full_number' => preg_replace('/\D/', '', $validated['card_number']),
                    'is_default' => $lockedUser->payoutMethods()->count() === 0,
                ]);
                Log::info('Withdraw payout method saved');
            }

            // Вызов API ЮKassa
            Log::info('Withdraw calling YooKassa API', ['destination_type' => 'bank_card']);
            $yooKassaService->createPayout($payout, $lockedUser, $destination);
            Log::info('Withdraw YooKassa API success', ['yookassa_payout_id' => $payout->fresh()->yookassa_payout_id]);

            return back()->with('success', 'Заявка на вывод создана и обрабатывается.');
        } catch (\Throwable $e) {
            report($e);

            Log::error('Withdraw exception caught', [
                'committed' => $committed,
                'agent_id' => config('services.yookassa_payout.shop_id'),
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
                'amount' => $this->mapYooKassaError($e->getMessage()),
            ]);
        }
    }

    public function refreshPayoutStatus(Request $request, YooKassaService $yooKassaService)
    {
        $validated = $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
        ]);

        $user = auth()->user();
        $transaction = Transaction::where('id', $validated['transaction_id'])
            ->where('from_user_id', $user->id)
            ->where('type', 'withdrawal')
            ->where('status', 'pending')
            ->with('payout')
            ->first();

        if (! $transaction || ! $transaction->payout || ! $transaction->payout->yookassa_payout_id) {
            return back()->with('error', 'Выплата не найдена или не имеет ID ЮKassa');
        }

        try {
            $info = $yooKassaService->getPayoutInfo($transaction->payout->yookassa_payout_id);
            $status = $info->getStatus();

            if ($status === 'succeeded' && $transaction->payout->isPending()) {
                DB::transaction(function () use ($transaction) {
                    $payout = \App\Models\Payout::where('id', $transaction->payout->id)->lockForUpdate()->first();
                    if ($payout->isPending()) {
                        $payout->update([
                            'status' => 'succeeded',
                            'succeeded_at' => now(),
                        ]);
                        $transaction->update(['status' => 'completed']);
                    }
                });

                return back()->with('success', 'Выплата подтверждена — статус обновлён.');
            } elseif ($status === 'canceled' && $transaction->payout->isPending()) {
                DB::transaction(function () use ($transaction) {
                    $payout = \App\Models\Payout::where('id', $transaction->payout->id)->lockForUpdate()->first();
                    if ($payout->isPending()) {
                        $payout->update([
                            'status' => 'canceled',
                            'canceled_at' => now(),
                        ]);
                        $transaction->update(['status' => 'cancelled']);
                        $payout->user->increment('balance', $payout->amount);
                    }
                });

                return back()->with('success', 'Выплата отменена — баланс возвращён.');
            }

            return back()->with('info', 'Текущий статус в ЮKassa: ' . $status);
        } catch (\Throwable $e) {
            Log::warning('Manual payout refresh failed', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Не удалось получить статус из ЮKassa: ' . $e->getMessage());
        }
    }
}
