<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {

    Route::get('/posts/create', [PostController::class, 'create'])->name('posts.create');
    Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
    Route::get('/posts/{post}/edit', [PostController::class, 'edit'])->name('posts.edit');
    Route::put('/posts/{post}', [PostController::class, 'update'])->name('posts.update');
    Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
    Route::post('/posts/{post}/like', [PostController::class, 'like'])->name('posts.like');

    Route::middleware('admin')->group(function () {

        Route::get('/admin', [AdminController::class, 'index'])->name('admin.index');
        Route::get('/admin/users', [AdminController::class, 'usersPage'])->name('admin.users.page');
        Route::get('/admin/posts', [AdminController::class, 'postsPage'])->name('admin.posts.page');
        Route::get('/admin/comments', [AdminController::class, 'commentsPage'])->name('admin.comments.page');

        Route::get('/api/admin/users', [AdminController::class, 'users'])->name('admin.users');
        Route::get('/api/admin/posts', [AdminController::class, 'posts'])->name('admin.posts');
        Route::get('/api/admin/comments', [AdminController::class, 'comments'])->name('admin.comments');
        Route::delete('/api/admin/posts/{post}', [AdminController::class, 'deletePost'])->name('admin.posts.delete');
        Route::delete('/api/admin/comments/{comment}', [AdminController::class, 'deleteComment'])->name('admin.comments.delete');
    });

    Route::get('/chats', [ChatController::class, 'index'])->name('chats.index');
    Route::get('/chats/{chat}', [ChatController::class, 'show'])->name('chat');
    Route::get('/chats/start/{user}', [ChatController::class, 'startChat'])->name('chats.start');
    Route::post('/chats/{chat}/messages', [ChatController::class, 'storeMessage'])->name('chats.messages.store');
    Route::match(['PUT', 'POST'], '/chats/{chat}/messages/{message}', [ChatController::class, 'updateMessage'])->name('chats.messages.update');
    Route::delete('/chats/{chat}/messages/{message}', [ChatController::class, 'deleteMessage'])->name('chats.messages.delete');
    Route::post('/posts/{post}/comments', [PostController::class, 'store'])->name('comments.store');
    Route::get('/profile/{user}/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile/{user}', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/{user}/aboutme', [ProfileController::class, 'updateAboutme'])->name('profile.update-aboutme');
    Route::post('/profile/update-avatar', [ProfileController::class, 'updateAvatar'])->name('profile.update-avatar');
    Route::post('/profile/{user}/subscribe', [ProfileController::class, 'subscribe'])->name('subscribe');
    Route::delete('/profile/{user}/unsubscribe', [ProfileController::class, 'unsubscribe'])->name('unsubscribe');
});

Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show');

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/profile/{user}', [ProfileController::class, 'show'])->name('profile');

Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::get('/register', [AuthController::class, 'showRegisterForm'])->name('register');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/profile/{user}', [ProfileController::class, 'show'])->name('profile');

Route::get('/profile/{user}/following', [ProfileController::class, 'following'])->name('following');
Route::get('/profile/{user}/followers', [ProfileController::class, 'followers'])->name('followers');
Route::get('/profile/{user}/liked-posts', [ProfileController::class, 'likedPosts'])->name('liked-posts');
Route::get('/ratings/{user}', [ProfileController::class, 'ratings'])->name('ratings');
