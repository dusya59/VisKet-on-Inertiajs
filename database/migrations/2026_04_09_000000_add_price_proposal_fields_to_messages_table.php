<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->boolean('is_price_proposal')->default(false)->after('file_path');
            $table->integer('proposed_price')->nullable()->after('is_price_proposal');
            $table->string('price_proposal_status')->nullable()->after('proposed_price');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['is_price_proposal', 'proposed_price', 'price_proposal_status']);
        });
    }
};
