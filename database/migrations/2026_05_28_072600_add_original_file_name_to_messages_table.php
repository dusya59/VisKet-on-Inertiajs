<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('messages', 'original_file_name')) {
            Schema::table('messages', function (Blueprint $table) {
                $table->string('original_file_name')->nullable()->after('file_path');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('messages', 'original_file_name')) {
            Schema::table('messages', function (Blueprint $table) {
                $table->dropColumn('original_file_name');
            });
        }
    }
};
