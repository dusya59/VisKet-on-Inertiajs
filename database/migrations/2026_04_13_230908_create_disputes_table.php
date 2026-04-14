<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignId('initiator_id')->constrained('users')->cascadeOnDelete();
            $table->text('reason');
            $table->enum('status', ['open', 'resolved', 'cancelled'])->default('open');
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('chat_id')->nullable();
            $table->text('resolution')->nullable();
            $table->timestamps();

            $table->foreign('chat_id')->references('id')->on('chats')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};
