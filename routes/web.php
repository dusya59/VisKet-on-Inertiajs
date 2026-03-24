<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BalanceController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {

    Route::get('/posts/create', [PostController::class, 'create'])->name('posts.create');
    Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
    Route::post('/posts/vacancy', [PostController::class, 'storeVacancy'])->name('posts.store-vacancy');
    Route::get('/posts/{post}/edit', [PostController::class, 'edit'])->name('posts.edit');
    Route::put('/posts/{post}', [PostController::class, 'update'])->name('posts.update');
    Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
    Route::post('/posts/{post}/like', [PostController::class, 'like'])->name('posts.like');

    Route::middleware('admin')->group(function () {

        Route::get('/admin', [AdminController::class, 'index'])->name('admin.index');
        Route::get('/admin/users', [AdminController::class, 'usersPage'])->name('admin.users.page');
        Route::get('/admin/verification-requests', [AdminController::class, 'verificationRequestsPage'])->name('admin.verification.page');
        Route::get('/admin/posts', [AdminController::class, 'postsPage'])->name('admin.posts.page');
        Route::get('/admin/comments', [AdminController::class, 'commentsPage'])->name('admin.comments.page');

        Route::get('/api/admin/users', [AdminController::class, 'users'])->name('admin.users');
        Route::get('/api/admin/posts', [AdminController::class, 'posts'])->name('admin.posts');
        Route::get('/api/admin/comments', [AdminController::class, 'comments'])->name('admin.comments');
        Route::delete('/api/admin/posts/{post}', [AdminController::class, 'deletePost'])->name('admin.posts.delete');
        Route::delete('/api/admin/comments/{comment}', [AdminController::class, 'deleteComment'])->name('admin.comments.delete');
        Route::post('/api/admin/users/{user}/approve', [AdminController::class, 'approveVerification'])->name('admin.users.approve');
        Route::post('/api/admin/users/{user}/reject', [AdminController::class, 'rejectVerification'])->name('admin.users.reject');
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

    Route::get('/balance', [BalanceController::class, 'index'])->name('balance');
    Route::post('/balance/add', [BalanceController::class, 'add'])->name('balance.add');
    Route::post('/balance/withdraw', [BalanceController::class, 'withdraw'])->name('balance.withdraw');

    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::get('/settings/profile', [SettingsController::class, 'profile'])->name('settings.profile');
    Route::get('/settings/privacy', [SettingsController::class, 'privacy'])->name('settings.privacy');
    Route::get('/notifications', [SettingsController::class, 'notifications'])->name('notifications');
    Route::post('/notifications/mark-read', [SettingsController::class, 'markAsRead'])->name('notifications.mark-read');

    Route::post('/vacancies/{vacancy}/respond', [ApplicationController::class, 'respond'])->name('vacancies.respond');
    Route::post('/applications/{application}/accept', [ApplicationController::class, 'accept'])->name('applications.accept');
    Route::post('/applications/{application}/reject', [ApplicationController::class, 'reject'])->name('applications.reject');

    Route::get('/api/skills', function () {
        return response()->json(Skill::all());
    });
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

Route::get('/auth/{provider}/redirect', [SocialiteController::class, 'redirect'])->where('provider', 'google|github');
Route::get('/auth/{provider}/callback', [SocialiteController::class, 'callback'])->where('provider', 'google|github');

Route::get('/profile/{user}', [ProfileController::class, 'show'])->name('profile');

Route::get('/profile/{user}/following', [ProfileController::class, 'following'])->name('following');
Route::get('/profile/{user}/followers', [ProfileController::class, 'followers'])->name('followers');
Route::get('/profile/{user}/liked-posts', [ProfileController::class, 'likedPosts'])->name('liked-posts');
Route::get('/ratings/{user}', [ProfileController::class, 'ratings'])->name('ratings');
