<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('active')->default(true);
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->enum('type', ['regular', 'vacancy'])->default('regular');
            $table->string('title');
            $table->text('description');
            $table->string('image')->default('');
            $table->timestamps();
        });

        Schema::create('vacancies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->string('position');
            $table->decimal('budget_min', 10, 2)->nullable();
            $table->decimal('budget_max', 10, 2)->nullable();
            $table->date('deadline')->nullable();
            $table->text('requirements')->nullable();
            $table->enum('status', ['open', 'in_progress', 'closed', 'cancelled'])->default('open');
            $table->timestamps();
        });

        Schema::create('vacancy_skills', function (Blueprint $table) {
            $table->foreignId('vacancy_id')->constrained()->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('level')->nullable();
            $table->primary(['vacancy_id', 'skill_id']);
        });

        Schema::create('user_skills', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('level')->nullable();
            $table->primary(['user_id', 'skill_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skills');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('vacancies');
        Schema::dropIfExists('vacancy_skills');
        Schema::dropIfExists('user_skills');
    }
};
