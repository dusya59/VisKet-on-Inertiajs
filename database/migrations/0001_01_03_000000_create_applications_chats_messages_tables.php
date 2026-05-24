<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vacancy_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('cover_letter')->nullable();
            $table->decimal('proposed_price', 10, 2)->nullable();
            $table->enum('status', ['pending', 'accepted', 'rejected', 'withdrawn', 'in_progress', 'completed', 'cancelled', 'disputed'])->default('pending');
            $table->timestamp('withdrawn_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('in_progress_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('disputed_at')->nullable();
            $table->timestamp('executor_marked_completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('chat_user', function (Blueprint $table) {
            $table->foreignId('chat_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('last_read_at')->nullable();
            $table->primary(['chat_id', 'user_id']);
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('content')->nullable();
            $table->text('image_path')->nullable();
            $table->text('video_path')->nullable();
            $table->text('file_path')->nullable();
            $table->boolean('is_system')->default(false);
            $table->boolean('is_price_proposal')->default(false);
            $table->integer('proposed_price')->nullable();
            $table->string('price_proposal_status')->nullable();
            $table->string('original_file_name')->nullable();
            $table->timestamps();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('application_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 10, 2);
            $table->enum('type', ['deposit', 'withdrawal', 'transfer', 'payment', 'refund']);
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->timestamp('completed_at')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
        Schema::dropIfExists('chats');
        Schema::dropIfExists('chat_user');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('transactions');
    }
};
