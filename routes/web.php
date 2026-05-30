<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BalanceController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DisputeController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SocialiteController;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show')->where('post', '[0-9]+');
Route::get('/api/posts/{post}/preview', function (App\Models\Post $post) {
    if ($post->is_hidden) {
        abort(404);
    }

    return response()->json([
        'id' => $post->id,
        'title' => $post->is_vacancy ? $post->vacancy->position : $post->title,
        'description' => $post->description,
        'image_url' => $post->image ? asset('storage/'.$post->image) : null,
    ]);
});
Route::get('/profile/{user}', [ProfileController::class, 'show'])->name('profile');
Route::get('/profile/{user}/following', [ProfileController::class, 'following'])->name('following');
Route::get('/profile/{user}/followers', [ProfileController::class, 'followers'])->name('followers');
Route::get('/profile/{user}/liked-posts', [ProfileController::class, 'likedPosts'])->name('liked-posts');
Route::get('/ratings/{user}', [ProfileController::class, 'ratings'])->name('ratings');

// Auth
Route::post('/payment/yookassa/create', [PaymentController::class, 'create'])
    ->middleware('auth')
    ->name('payment.create');

Route::post('/payment/yookassa/webhook', [PaymentController::class, 'webhook'])
    ->middleware('throttle:60,1')
    ->name('payment.webhook');

Route::get('/payment/success', [PaymentController::class, 'success'])
    ->name('payment.success');

Route::get('/payment/fail', [PaymentController::class, 'fail'])
    ->name('payment.fail');

Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::get('/register', [AuthController::class, 'showRegisterForm'])->name('register');
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Email Verification
Route::get('/email/verify/{id}/{hash}', function (Request $request) {
    $user = \App\Models\User::findOrFail($request->id);
    if (! hash_equals(sha1($user->getEmailForVerification()), $request->hash)) {
        abort(403);
    }
    $user->markEmailAsVerified();

    return redirect('/settings/profile')->with('message', 'Email подтверждён!');
})->middleware(['signed'])->name('verification.verify');

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();

    return back()->with('message', 'Ссылка для подтверждения отправлена!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');

Route::get('/auth/{provider}/redirect', [SocialiteController::class, 'redirect'])->where('provider', 'google|github');
Route::get('/auth/{provider}/callback', [SocialiteController::class, 'callback'])->where('provider', 'google|github');

Route::middleware(['auth'])->group(function () {

    // Posts
    Route::get('/posts/create', [PostController::class, 'create'])->name('posts.create');
    Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
    Route::post('/posts/vacancy', [PostController::class, 'storeVacancy'])->name('posts.store-vacancy');
    Route::get('/posts/{post}/edit', [PostController::class, 'edit'])->name('posts.edit')->where('post', '[0-9]+');
    Route::put('/posts/{post}', [PostController::class, 'update'])->name('posts.update')->where('post', '[0-9]+');
    Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy')->where('post', '[0-9]+');
    Route::post('/posts/{post}/like', [PostController::class, 'like'])->name('posts.like')->where('post', '[0-9]+');
    Route::post('/posts/{post}/report', [ReportController::class, 'reportPost'])->name('posts.report')->where('post', '[0-9]+');
    Route::post('/posts/{post}/share', [PostController::class, 'share'])->name('posts.share')->where('post', '[0-9]+');

    // Comments
    Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->name('comments.store')->where('post', '[0-9]+');
    Route::put('/comments/{comment}', [CommentController::class, 'update'])->name('comments.update');
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');
    Route::post('/comments/{comment}/report', [CommentController::class, 'report'])->name('comments.report');

    // Profile
    Route::get('/profile/{user}/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile/{user}', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/{user}/aboutme', [ProfileController::class, 'updateAboutme'])->name('profile.update-aboutme');
    Route::post('/profile/update-avatar', [ProfileController::class, 'updateAvatar'])->name('profile.update-avatar');
    Route::post('/profile/{user}/subscribe', [ProfileController::class, 'subscribe'])->name('subscribe');
    Route::delete('/profile/{user}/unsubscribe', [ProfileController::class, 'unsubscribe'])->name('unsubscribe');

    // Chats
    Route::get('/chats', [ChatController::class, 'index'])->name('chats.index');
    Route::get('/chats/search', [ChatController::class, 'search'])->name('chats.search');
    Route::get('/chats/{chat}', [ChatController::class, 'show'])->name('chat');
    Route::get('/chats/start/{user}', [ChatController::class, 'startChat'])->name('chats.start');
    Route::post('/chats/{chat}/messages', [ChatController::class, 'storeMessage'])->name('chats.messages.store');
    Route::match(['PUT', 'POST'], '/chats/{chat}/messages/{message}', [ChatController::class, 'updateMessage'])->name('chats.messages.update');
    Route::delete('/chats/{chat}/messages/{message}', [ChatController::class, 'deleteMessage'])->name('chats.messages.delete');
    Route::delete('/chats/{chat}/messages', [ChatController::class, 'deleteMessagesBulk'])->name('chats.messages.deleteBulk');

    // Balance
    Route::get('/balance', [BalanceController::class, 'index'])->name('balance');
    Route::post('/balance/add', [BalanceController::class, 'add'])->middleware('throttle:10,1')->name('balance.add');
    Route::post('/balance/withdraw', [BalanceController::class, 'withdraw'])->middleware('throttle:10,1')->name('balance.withdraw');
    Route::get('/balance/sbp-banks', [BalanceController::class, 'sbpBanks'])->name('balance.sbp-banks');

    // Settings
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::get('/settings/profile', [SettingsController::class, 'profile'])->name('settings.profile');
    Route::get('/settings/privacy', [SettingsController::class, 'privacy'])->name('settings.privacy');
    Route::get('/settings/files', [SettingsController::class, 'files'])->name('settings.files');
    Route::post('/settings/request-verification', [SettingsController::class, 'requestVerification'])->name('settings.request-verification');
    Route::post('/settings/resend-email-verification', [SettingsController::class, 'resendEmailVerification'])->name('settings.resend-email-verification');
    Route::get('/notifications', [SettingsController::class, 'notifications'])->name('notifications');
    Route::post('/notifications/mark-read', [SettingsController::class, 'markAsRead'])->name('notifications.mark-read');

    // Applications
    Route::post('/vacancies/{vacancy}/respond', [ApplicationController::class, 'respond'])->name('vacancies.respond');
    Route::post('/applications/{application}/accept', [ApplicationController::class, 'accept'])->name('applications.accept');
    Route::post('/applications/{application}/reject', [ApplicationController::class, 'reject'])->name('applications.reject');
    Route::post('/applications/{application}/withdraw', [ApplicationController::class, 'withdraw'])->name('applications.withdraw');
    Route::post('/applications/{application}/close-vacancy', [ApplicationController::class, 'closeVacancy'])->name('applications.close-vacancy');
    Route::post('/applications/{application}/confirm-completion', [ApplicationController::class, 'confirmCompletion'])->name('applications.confirm-completion');
    Route::post('/applications/{application}/mark-completed', [ApplicationController::class, 'markCompleted'])->name('applications.mark-completed');
    Route::post('/applications/{application}/cancel', [ApplicationController::class, 'cancel'])->name('applications.cancel');
    Route::post('/applications/{application}/propose-price', [ApplicationController::class, 'proposePrice'])->name('applications.propose-price');
    Route::post('/messages/{message}/accept-price', [ApplicationController::class, 'acceptPriceProposal'])->name('messages.accept-price');
    Route::get('/messages/{message}/respond-price', [ApplicationController::class, 'respondToPriceProposal'])->name('messages.respond-price');

    // Disputes
    Route::post('/disputes', [DisputeController::class, 'store'])->name('disputes.store');
    Route::post('/disputes/{dispute}/cancel', [DisputeController::class, 'cancel'])->name('disputes.cancel');

    Route::get('/api/skills', function () {
        return response()->json(Skill::all());
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('admin')->group(function () {
        Route::get('/admin', [AdminController::class, 'index'])->name('admin.index');
        Route::get('/admin/users', [AdminController::class, 'usersPage'])->name('admin.users.page');
        Route::get('/admin/verification-requests', [AdminController::class, 'verificationRequestsPage'])->name('admin.verification.page');
        Route::get('/admin/posts', [AdminController::class, 'postsPage'])->name('admin.posts.page');
        Route::get('/admin/comments', [AdminController::class, 'commentsPage'])->name('admin.comments.page');

        // ИСПРАВЛЕНО: Убран префикс /api для веб-маршрутов
        Route::get('/admin/users/data', [AdminController::class, 'users'])->name('admin.users');
        Route::get('/admin/posts/data', [AdminController::class, 'posts'])->name('admin.posts');
        Route::get('/admin/comments/data', [AdminController::class, 'comments'])->name('admin.comments');
        Route::delete('/admin/posts/{post}', [AdminController::class, 'deletePost'])->name('admin.posts.delete');
        Route::delete('/admin/comments/{comment}', [AdminController::class, 'deleteComment'])->name('admin.comments.delete');
        Route::post('/admin/users/{user}/approve', [AdminController::class, 'approveVerification'])->name('admin.users.approve');
        Route::post('/admin/users/{user}/reject', [AdminController::class, 'rejectVerification'])->name('admin.users.reject');
        Route::post('/admin/users/{user}/dismiss-reports', [AdminController::class, 'dismissUserReports'])->name('admin.users.dismiss-reports');
        Route::delete('/admin/users/{user}', [AdminController::class, 'deleteUser'])->name('admin.users.delete');
        Route::post('/admin/posts/{post}/dismiss-reports', [AdminController::class, 'dismissPostReports'])->name('admin.posts.dismiss-reports');
        Route::post('/admin/posts/{post}/warn', [AdminController::class, 'warnPost'])->name('admin.posts.warn');
        Route::post('/admin/posts/{post}/hide', [AdminController::class, 'hidePost'])->name('admin.posts.hide');
        Route::post('/admin/comments/{comment}/dismiss-reports', [AdminController::class, 'dismissCommentReports'])->name('admin.comments.dismiss-reports');

        // Disputes (admin only)
        Route::get('/admin/disputes', [DisputeController::class, 'index'])->name('admin.disputes.index');
        Route::get('/admin/disputes/{dispute}', [DisputeController::class, 'show'])->name('admin.disputes.show');
        Route::post('/admin/disputes/{dispute}/take', [DisputeController::class, 'take'])->name('admin.disputes.take');
        Route::post('/admin/disputes/{dispute}/resolve', [DisputeController::class, 'resolve'])->name('admin.disputes.resolve');
    });
});
