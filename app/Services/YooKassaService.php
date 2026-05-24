<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\User;
use YooKassa\Client;

class YooKassaService
{
    private Client $client;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setAuth(config('services.yookassa.shop_id'), config('services.yookassa.secret_key'));
    }

    public function createPayment(User $user, float $amount): Payment
    {
        $idempotenceKey = 'payment_' . $user->id . '_' . uniqid();

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
                uniqid('capture_', true)
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
                uniqid('capture_', true)
            );
        }

        return $payment->fresh();
    }

    private function applySucceededPayment(Payment $payment, ?string $paymentMethod): void
    {
        $payment->update([
            'status' => 'succeeded',
            'paid_at' => now(),
            'payment_method' => $paymentMethod,
        ]);

        $user = $payment->user;
        $user->balance += $payment->amount;
        $user->save();

        $user->transactions()->create([
            'from_user_id' => null,
            'to_user_id' => $user->id,
            'amount' => $payment->amount,
            'type' => 'deposit',
            'status' => 'completed',
            'description' => 'Пополнение баланса через ЮKassa',
        ]);
    }
}
