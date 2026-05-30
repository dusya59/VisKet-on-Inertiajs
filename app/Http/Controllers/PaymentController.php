<?php

namespace App\Http\Controllers;

use App\Services\YooKassaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function __construct(
        private YooKassaService $yooKassaService
    ) {}

    public function create(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1|max:100000',
        ]);

        $user = $request->user();

        Log::info('Payment creation initiated', [
            'user_id' => $user->id,
            'amount' => $validated['amount'],
        ]);

        $payment = $this->yooKassaService->createPayment($user, $validated['amount']);

        return Inertia::location($payment->confirmation_url);
    }

    public function webhook(Request $request)
    {
        $requestBody = $request->getContent();
        $signatureHeader = $request->header('X-Signature');

        // Пробуем основной secret_key
        $verified = $this->yooKassaService->verifyWebhookSignature($requestBody, $signatureHeader);

        // Пробуем payout secret_key
        if (! $verified) {
            $verified = $this->yooKassaService->verifyWebhookSignature(
                $requestBody,
                $signatureHeader,
                config('services.yookassa_payout.secret_key')
            );
        }

        if (! $verified) {
            Log::warning('YooKassa webhook: signature verification failed', [
                'ip' => $request->ip(),
            ]);

            return response('Invalid signature', 403);
        }

        $payload = $request->all();
        $event = $payload['event'] ?? '';

        if (str_starts_with($event, 'payment.')) {
            $this->yooKassaService->processNotification($payload);
        } elseif (str_starts_with($event, 'payout.')) {
            $this->yooKassaService->processPayoutNotification($payload);
        } else {
            Log::warning('YooKassa webhook: unknown event type', ['event' => $event]);
        }

        return response('OK', 200);
    }

    public function success()
    {
        $user = auth()->user();

        if ($user) {
            $lastPayment = $user->payments()->latest()->first();

            if ($lastPayment && $lastPayment->isPending()) {
                $lastPayment = $this->yooKassaService->confirmPayment($lastPayment);
            }
        }

        $succeeded = isset($lastPayment) && $lastPayment->isSucceeded();

        return Inertia::render('Payment/Result', [
            'status' => $succeeded ? 'success' : ($lastPayment?->isCanceled() ? 'fail' : 'pending'),
            'amount' => $lastPayment?->amount,
        ]);
    }

    public function fail()
    {
        return Inertia::render('Payment/Result', [
            'status' => 'fail',
            'amount' => null,
        ]);
    }
}
