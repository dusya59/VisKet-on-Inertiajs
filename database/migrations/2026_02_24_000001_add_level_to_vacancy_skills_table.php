<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vacancy_skills', function (Blueprint $table) {
            $table->tinyInteger('level')->default(3)->after('skill_id');
        });
    }

    public function down(): void
    {
        Schema::table('vacancy_skills', function (Blueprint $table) {
            $table->dropColumn('level');
        });
    }
};
