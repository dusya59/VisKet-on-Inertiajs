<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Payout;
use App\Models\PayoutMethod;
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

    public function createPayout(User $user, float $amount, string $type, array $destination, ?PayoutMethod $method = null): Payout
    {
        $idempotenceKey = 'payout_' . $user->id . '_' . \Illuminate\Support\Str::uuid()->toString();

        $payoutData = [
            'amount' => [
                'value' => number_format($amount, 2, '.', ''),
                'currency' => 'RUB',
            ],
            'payout_destination_data' => $destination,
            'description' => 'Вывод средств пользователем #' . $user->id,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ];

        $client = $this->getPayoutClient();
        $response = $client->createPayout($payoutData, $idempotenceKey);

        return Payout::create([
            'user_id' => $user->id,
            'payout_method_id' => $method?->id,
            'amount' => $amount,
            'currency' => 'RUB',
            'yookassa_payout_id' => $response->getId(),
            'status' => $response->getStatus(),
            'description' => $payoutData['description'],
            'metadata' => $payoutData['metadata'],
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

        if (!$event || !$object || !isset($object['id'])) {
            return null;
        }

        $yookassaPayoutId = $object['id'];

        /** @var Payout|null $payout */
        $payout = Payout::where('yookassa_payout_id', $yookassaPayoutId)->first();

        if (!$payout) {
            return null;
        }

        $newStatus = match ($event) {
            'payout.succeeded' => 'succeeded',
            'payout.canceled' => 'canceled',
            default => $payout->status,
        };

        if ($newStatus === 'succeeded' && $payout->isPending()) {
            DB::transaction(function () use ($payout) {
                $lockedPayout = Payout::where('id', $payout->id)->lockForUpdate()->first();

                if (!$lockedPayout->isPending()) {
                    return;
                }

                $lockedPayout->update([
                    'status' => 'succeeded',
                    'succeeded_at' => now(),
                ]);

                if ($lockedPayout->transaction) {
                    $lockedPayout->transaction->update(['status' => 'completed']);
                }

                Log::info('Payout succeeded', [
                    'payout_id' => $lockedPayout->id,
                    'user_id' => $lockedPayout->user_id,
                    'amount' => $lockedPayout->amount,
                ]);
            });
        } elseif ($newStatus === 'canceled' && $payout->isPending()) {
            DB::transaction(function () use ($payout) {
                $lockedPayout = Payout::where('id', $payout->id)->lockForUpdate()->first();

                if (!$lockedPayout->isPending()) {
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

                Log::info('Payout canceled, balance refunded', [
                    'payout_id' => $lockedPayout->id,
                    'user_id' => $user->id,
                    'amount' => $lockedPayout->amount,
                ]);
            });
        }

        return $payout->fresh();
    }

    public function getSbpBanks(): array
    {
        try {
            $response = $this->getPayoutClient()->getSbpBanks();
            $banks = [];

            foreach ($response->getItems() as $bank) {
                $banks[] = [
                    'bank_id' => $bank->getBankId(),
                    'name' => $bank->getName(),
                ];
            }

            return $banks;
        } catch (\Exception $e) {
            Log::warning('Failed to fetch SBP banks from YooKassa', [
                'error' => $e->getMessage(),
                'agent_id' => config('services.yookassa_payout.shop_id'),
            ]);

            return [];
        }
    }
}
