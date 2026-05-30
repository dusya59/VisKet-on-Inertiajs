<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payout_method_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('RUB');
            $table->string('yookassa_payout_id')->nullable()->unique();
            $table->string('status'); // pending | succeeded | canceled
            $table->string('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('succeeded_at')->nullable();
            $table->timestamp('canceled_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payouts');
    }
};
