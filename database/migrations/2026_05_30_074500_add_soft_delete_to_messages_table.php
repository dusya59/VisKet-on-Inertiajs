<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->json('deleted_for_user_ids')->nullable()->after('reply_to_id');
            $table->boolean('deleted_for_everyone')->default(false)->after('deleted_for_user_ids');
            $table->foreignId('deleted_by_id')->nullable()->constrained('users')->nullOnDelete()->after('deleted_for_everyone');
            $table->timestamp('hidden_at')->nullable()->after('deleted_by_id');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['deleted_for_user_ids', 'deleted_for_everyone', 'hidden_at']);
            $table->dropForeign(['deleted_by_id']);
            $table->dropColumn('deleted_by_id');
        });
    }
};
