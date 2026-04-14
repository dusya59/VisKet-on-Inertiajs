<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\Transaction;
use Illuminate\Console\Command;

class CompletePendingTransactions extends Command
{
    protected $signature = 'app:complete-pending-transactions';

    protected $description = 'Завершает pending транзакции через 7 дней после подтверждения завершения работы';

    public function handle()
    {
        $pendingTransactions = Transaction::where('status', 'pending')
            ->whereNotNull('completed_at')
            ->get();

        $completed = 0;

        foreach ($pendingTransactions as $transaction) {
            if ($transaction->isReadyForCompletion()) {
                $this->processTransaction($transaction);
                $completed++;
            }
        }

        $this->info("Завершено транзакций: {$completed}");
    }

    protected function processTransaction(Transaction $transaction)
    {
        $recipient = $transaction->toUser();

        $transaction->update(['status' => 'completed']);

        $recipient->balance += $transaction->amount;
        $recipient->save();

        $application = $transaction->application;
        if ($application) {
            $application->update(['status' => 'completed']);
        }

        $sender = $transaction->fromUser;
        Notification::create([
            'user_id' => $recipient->id,
            'type' => 'payment_completed',
            'title' => 'Средства зачислены',
            'content' => "Средства в размере {$transaction->amount} ₽ зачислены на ваш счёт.{$transaction->description}",
            'link' => '/balance',
            'is_read' => false,
        ]);

        if ($sender) {
            Notification::create([
                'user_id' => $sender->id,
                'type' => 'payment_sent',
                'title' => 'Платёж завершён',
                'content' => "Платёж в размере {$transaction->amount} ₽ успешно переведён получателю.",
                'link' => '/balance',
                'is_read' => false,
            ]);
        }

        $this->line("Транзакция #{$transaction->id} завершена: {$transaction->amount} ₽");
    }
}
