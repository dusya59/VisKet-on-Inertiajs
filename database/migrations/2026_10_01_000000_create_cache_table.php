<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->unique(); // Уникальный ключ кэша
            $table->text('value'); // Сериализованные данные
            $table->timestamp('expires_at')->nullable(); // Срок истечения
        });
    }

    public function down()
    {
        Schema::dropIfExists('cache');
    }
};
