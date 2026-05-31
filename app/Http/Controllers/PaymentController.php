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
        $authHeader = $request->header('Authorization');
        $signatureHeader = $request->header('X-Signature');

        $verified = false;

        // Пробуем HTTP Basic Auth (реальный формат YooKassa)
        if (!empty($authHeader) && str_starts_with($authHeader, 'Basic ')) {
            $credentials = base64_decode(substr($authHeader, 6));
            $parts = explode(':', $credentials, 2);
            if (count($parts) === 2) {
                [$shopId, $secretKey] = $parts;
                $expected = base64_encode(config('services.yookassa.shop_id') . ':' . config('services.yookassa.secret_key'));
                $expectedPayout = base64_encode(config('services.yookassa_payout.shop_id') . ':' . config('services.yookassa_payout.secret_key'));
                if (hash_equals($expected, substr($authHeader, 6)) || hash_equals($expectedPayout, substr($authHeader, 6))) {
                    $verified = true;
                }
            }
        }

        // Fallback: пробуем X-Signature
        if (! $verified && !empty($signatureHeader)) {
            $verified = $this->yooKassaService->verifyWebhookSignature($requestBody, $signatureHeader);
            if (! $verified) {
                $verified = $this->yooKassaService->verifyWebhookSignature(
                    $requestBody,
                    $signatureHeader,
                    config('services.yookassa_payout.secret_key')
                );
            }
        }

        $event = $request->input('event', '');

        Log::info('YooKassa webhook received', [
            'ip' => $request->ip(),
            'event' => $event,
            'verified' => $verified,
            'has_auth' => !empty($authHeader),
            'has_signature' => !empty($signatureHeader),
        ]);

        if (! $verified) {
            Log::warning('YooKassa webhook: verification failed', [
                'ip' => $request->ip(),
                'event' => $event,
                'auth_prefix' => $authHeader ? substr($authHeader, 0, 20) : null,
            ]);

            // В тестовом окружении (test_* ключ) разрешаем всё ради отладки
            if (str_starts_with(config('services.yookassa_payout.secret_key', ''), 'test_')) {
                Log::info('YooKassa webhook: test mode, accepting without verification');
                $verified = true;
            } else {
                return response('Invalid signature', 403);
            }
        }

        $payload = $request->all();

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
