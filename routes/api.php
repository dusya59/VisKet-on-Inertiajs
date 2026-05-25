<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatSearchController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PostGeneratorController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:api')->group(function () {
    // Публичные маршруты
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    // Публичный просмотр
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/{id}', [PostController::class, 'show']);

    // Генератор постов (требует аутентификации)
    Route::prefix('generator')->middleware('auth:sanctum')->group(function () {
        Route::post('/post', [PostGeneratorController::class, 'generateSingle']);
        Route::post('/posts/batch', [PostGeneratorController::class, 'generateBatch']);
    });

    // Защищенные маршруты
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/posts', [PostController::class, 'store']);
        Route::put('/posts/{id}', [PostController::class, 'update']);
        Route::delete('/posts/{id}', [PostController::class, 'destroy']);

        // Поиск по чатам
        Route::get('/chats/search', [ChatSearchController::class, 'search']);
    });
});
