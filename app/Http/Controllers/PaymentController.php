<?php

namespace App\Http\Controllers;

use App\Services\YooKassaService;
use Illuminate\Http\Request;
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

        $payment = $this->yooKassaService->createPayment($user, $validated['amount']);

        return Inertia::location($payment->confirmation_url);
    }

    public function webhook(Request $request)
    {
        $payload = $request->all();

        $this->yooKassaService->processNotification($payload);

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
