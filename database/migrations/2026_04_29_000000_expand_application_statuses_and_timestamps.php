<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE applications MODIFY COLUMN status ENUM('pending','accepted','rejected','withdrawn','in_progress','completed','cancelled','disputed') NOT NULL DEFAULT 'pending'");
        }

        Schema::table('applications', function (Blueprint $table) {
            $table->timestamp('accepted_at')->nullable()->after('withdrawn_at');
            $table->timestamp('in_progress_at')->nullable()->after('accepted_at');
            $table->timestamp('cancelled_at')->nullable()->after('completed_at');
            $table->timestamp('disputed_at')->nullable()->after('cancelled_at');
            $table->timestamp('executor_marked_completed_at')->nullable()->after('disputed_at');
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn([
                'accepted_at',
                'in_progress_at',
                'cancelled_at',
                'disputed_at',
                'executor_marked_completed_at',
            ]);
        });

        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE applications MODIFY COLUMN status ENUM('pending','accepted','rejected','withdrawn') NOT NULL DEFAULT 'pending'");
        }
    }
};
