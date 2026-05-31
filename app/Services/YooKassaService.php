<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Payout;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use YooKassa\Client;

class YooKassaService
{
    private Client $client;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setAuth(config('services.yookassa.shop_id'), config('services.yookassa.secret_key'));
    }

    public function verifyWebhookSignature(string $requestBody, ?string $signatureHeader, ?string $secretKey = null): bool
    {
        if (empty($signatureHeader)) {
            Log::warning('YooKassa webhook: missing signature header');
            return false;
        }

        $secretKey ??= config('services.yookassa.secret_key');
        $expectedSignature = base64_encode(hash('sha256', $requestBody . $secretKey, true));

        if (!hash_equals($expectedSignature, $signatureHeader)) {
            Log::warning('YooKassa webhook: invalid signature', [
                'expected_prefix' => substr($expectedSignature, 0, 8) . '...',
            ]);
            return false;
        }

        return true;
    }

    public function createPayment(User $user, float $amount): Payment
    {
        $idempotenceKey = 'payment_' . $user->id . '_' . \Illuminate\Support\Str::uuid()->toString();

        $response = $this->client->createPayment(
            [
                'amount' => [
                    'value' => number_format($amount, 2, '.', ''),
                    'currency' => 'RUB',
                ],
                'confirmation' => [
                    'type' => 'redirect',
                    'return_url' => route('payment.success'),
                ],
                'capture' => true,
                'description' => 'Пополнение баланса на сумму ' . number_format($amount, 2, '.', '') . ' руб.',
                'metadata' => [
                    'user_id' => $user->id,
                ],
            ],
            $idempotenceKey
        );

        $payment = Payment::create([
            'user_id' => $user->id,
            'amount' => $amount,
            'currency' => 'RUB',
            'yookassa_payment_id' => $response->getId(),
            'status' => $response->getStatus(),
            'confirmation_url' => $response->getConfirmation()->getConfirmationUrl(),
        ]);

        return $payment;
    }

    public function getPaymentInfo(string $yookassaPaymentId): \YooKassa\Model\Payment\Payment
    {
        return $this->client->getPaymentInfo($yookassaPaymentId);
    }

    public function confirmPayment(Payment $payment): Payment
    {
        $info = $this->getPaymentInfo($payment->yookassa_payment_id);

        if ($info->getStatus() === 'succeeded' && $payment->isPending()) {
            $this->applySucceededPayment($payment, $info->getPaymentMethod()?->getType());
        } elseif ($info->getStatus() === 'canceled' && $payment->isPending()) {
            $payment->update(['status' => 'canceled']);
        } elseif ($info->getStatus() === 'waiting_for_capture') {
            $payment->update(['status' => 'waiting_for_capture']);
            $this->client->capturePayment(
                [
                    'amount' => [
                        'value' => number_format((float) $payment->amount, 2, '.', ''),
                        'currency' => 'RUB',
                    ],
                ],
                $payment->yookassa_payment_id,
                \Illuminate\Support\Str::uuid()->toString()
            );
        }

        return $payment->fresh();
    }

    public function processNotification(array $payload): ?Payment
    {
        $event = $payload['event'] ?? null;
        $object = $payload['object'] ?? null;

        if (!$event || !$object || !isset($object['id'])) {
            return null;
        }

        $yookassaPaymentId = $object['id'];

        /** @var Payment|null $payment */
        $payment = Payment::where('yookassa_payment_id', $yookassaPaymentId)->first();

        if (!$payment) {
            return null;
        }

        $newStatus = match ($event) {
            'payment.succeeded' => 'succeeded',
            'payment.waiting_for_capture' => 'waiting_for_capture',
            'payment.canceled' => 'canceled',
            default => $payment->status,
        };

        if ($newStatus === 'succeeded' && $payment->isPending()) {
            $this->applySucceededPayment($payment, $object['payment_method']['type'] ?? null);
        } elseif ($newStatus === 'canceled' && $payment->isPending()) {
            $payment->update(['status' => 'canceled']);
        } elseif ($newStatus === 'waiting_for_capture') {
            $payment->update(['status' => 'waiting_for_capture']);
            $this->client->capturePayment(
                [
                    'amount' => [
                        'value' => number_format((float) $payment->amount, 2, '.', ''),
                        'currency' => 'RUB',
                    ],
                ],
                $yookassaPaymentId,
                \Illuminate\Support\Str::uuid()->toString()
            );
        }

        return $payment->fresh();
    }

    private function applySucceededPayment(Payment $payment, ?string $paymentMethod): void
    {
        DB::transaction(function () use ($payment, $paymentMethod) {
            $payment = Payment::where('id', $payment->id)->lockForUpdate()->first();

            if ($payment->status !== 'pending') {
                return;
            }

            $payment->update([
                'status' => 'succeeded',
                'paid_at' => now(),
                'payment_method' => $paymentMethod,
            ]);

            $user = User::where('id', $payment->user_id)->lockForUpdate()->first();
            $user->increment('balance', $payment->amount);

            $user->transactions()->create([
                'from_user_id' => null,
                'to_user_id' => $user->id,
                'amount' => $payment->amount,
                'type' => 'deposit',
                'status' => 'completed',
                'description' => 'Пополнение баланса через ЮKassa',
            ]);

            Log::info('Payment succeeded', [
                'payment_id' => $payment->id,
                'user_id' => $user->id,
                'amount' => $payment->amount,
            ]);
        });
    }

    /* ================================================================
     * Payouts
     * ================================================================ */

    private function getPayoutClient(): Client
    {
        $shopId = config('services.yookassa_payout.shop_id');
        $secretKey = config('services.yookassa_payout.secret_key');

        if (empty($shopId) || empty($secretKey)) {
            throw new \RuntimeException('YooKassa payout credentials are not configured.');
        }

        $client = new Client();
        $client->setAuth($shopId, $secretKey);

        return $client;
    }

    public function createPayout(Payout $payout, User $user, array $destination): void
    {
        $idempotenceKey = 'payout_' . $user->id . '_' . \Illuminate\Support\Str::uuid()->toString();

        $payoutData = [
            'amount' => [
                'value' => number_format((float) $payout->amount, 2, '.', ''),
                'currency' => 'RUB',
            ],
            'payout_destination_data' => $destination,
            'description' => $payout->description,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ];

        $client = $this->getPayoutClient();
        $response = $client->createPayout($payoutData, $idempotenceKey);

        $payout->update([
            'yookassa_payout_id' => $response->getId(),
            'status' => $response->getStatus(),
        ]);
    }

    public function getPayoutInfo(string $yookassaPayoutId): \YooKassa\Request\Payouts\PayoutResponse
    {
        return $this->getPayoutClient()->getPayoutInfo($yookassaPayoutId);
    }

    public function processPayoutNotification(array $payload): ?Payout
    {
        $event = $payload['event'] ?? null;
        $object = $payload['object'] ?? null;

        Log::info('Webhook processPayoutNotification start', [
            'event' => $event,
            'has_object' => !empty($object),
            'object_id' => $object['id'] ?? null,
        ]);

        if (!$event || !$object || !isset($object['id'])) {
            Log::warning('Webhook payout: missing event or object id', [
                'event' => $event,
                'object_keys' => $object ? array_keys($object) : null,
            ]);
            return null;
        }

        $yookassaPayoutId = $object['id'];

        /** @var Payout|null $payout */
        $payout = Payout::where('yookassa_payout_id', $yookassaPayoutId)->first();

        if (!$payout) {
            Log::warning('Webhook payout: payout not found by yookassa_payout_id', [
                'yookassa_payout_id' => $yookassaPayoutId,
            ]);
            return null;
        }

        Log::info('Webhook payout: found', [
            'payout_id' => $payout->id,
            'current_status' => $payout->status,
            'is_pending' => $payout->isPending(),
            'event' => $event,
        ]);

        $newStatus = match ($event) {
            'payout.succeeded' => 'succeeded',
            'payout.canceled' => 'canceled',
            default => $payout->status,
        };

        Log::info('Webhook payout: mapped status', [
            'new_status' => $newStatus,
            'event' => $event,
        ]);

        if ($newStatus === 'succeeded' && $payout->isPending()) {
            DB::transaction(function () use ($payout) {
                $lockedPayout = Payout::where('id', $payout->id)->lockForUpdate()->first();

                if (!$lockedPayout->isPending()) {
                    Log::info('Webhook payout: not pending anymore (race condition)', [
                        'payout_id' => $lockedPayout->id,
                        'current_status' => $lockedPayout->status,
                    ]);
                    return;
                }

                $lockedPayout->update([
                    'status' => 'succeeded',
                    'succeeded_at' => now(),
                ]);

                if ($lockedPayout->transaction) {
                    $lockedPayout->transaction->update(['status' => 'completed']);
                }

                Log::info('Webhook payout: succeeded processed', [
                    'payout_id' => $lockedPayout->id,
                    'transaction_id' => $lockedPayout->transaction?->id,
                    'user_id' => $lockedPayout->user_id,
                    'amount' => $lockedPayout->amount,
                ]);
            });
        } elseif ($newStatus === 'canceled' && $payout->isPending()) {
            DB::transaction(function () use ($payout) {
                $lockedPayout = Payout::where('id', $payout->id)->lockForUpdate()->first();

                if (!$lockedPayout->isPending()) {
                    Log::info('Webhook payout: not pending anymore (race condition)', [
                        'payout_id' => $lockedPayout->id,
                        'current_status' => $lockedPayout->status,
                    ]);
                    return;
                }

                $lockedPayout->update([
                    'status' => 'canceled',
                    'canceled_at' => now(),
                ]);

                if ($lockedPayout->transaction) {
                    $lockedPayout->transaction->update(['status' => 'cancelled']);
                }

                $user = User::where('id', $lockedPayout->user_id)->lockForUpdate()->first();
                $user->increment('balance', $lockedPayout->amount);

                Log::info('Webhook payout: canceled processed', [
                    'payout_id' => $lockedPayout->id,
                    'transaction_id' => $lockedPayout->transaction?->id,
                    'user_id' => $user->id,
                    'amount' => $lockedPayout->amount,
                ]);
            });
        } else {
            Log::info('Webhook payout: no action needed', [
                'payout_id' => $payout->id,
                'new_status' => $newStatus,
                'is_pending' => $payout->isPending(),
            ]);
        }

        $fresh = $payout->fresh();
        Log::info('Webhook payout: finished', [
            'payout_id' => $payout->id,
            'final_status' => $fresh?->status,
        ]);

        return $fresh;
    }


}
