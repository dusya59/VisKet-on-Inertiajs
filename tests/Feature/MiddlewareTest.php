<?php

use App\Models\Chat;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Post;
use App\Models\User;

describe('AdminMiddleware', function () {
    test('allows admin to access admin routes', function () {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->get('/admin');

        $response->assertStatus(200);
    });

    test('denies non-admin user from accessing admin routes', function () {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/admin');

        $response->assertStatus(403);
    });

    test('denies guest from accessing admin routes', function () {
        $response = $this->get('/admin');

        $response->assertRedirect(route('login'));
    });

    test('allows admin to access admin users page', function () {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->get('/admin/users');

        $response->assertStatus(200);
    });

    test('denies non-admin from accessing admin users page', function () {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/admin/users');

        $response->assertStatus(403);
    });

    test('allows admin to access admin disputes page', function () {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->get('/admin/disputes');

        $response->assertStatus(200);
    });
});

describe('Authenticate middleware', function () {
    test('redirects guest to login on protected route', function () {
        $response = $this->get('/chats');

        $response->assertRedirect(route('login'));
    });

    test('allows authenticated user to access protected route', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/chats');

        $response->assertStatus(200);
    });

    test('redirects guest to login on balance route', function () {
        $response = $this->get('/balance');

        $response->assertRedirect(route('login'));
    });

    test('allows authenticated user to access balance route', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/balance');

        $response->assertStatus(200);
    });
});

describe('HandleInertiaRequests middleware', function () {
    test('shares auth user data for authenticated user', function () {
        $user = User::factory()->create(['is_admin' => true, 'balance' => 12345.50]);

        $response = $this->actingAs($user)->get('/');

        $response->assertInertia(fn ($page) => $page
            ->has('auth.user')
            ->where('auth.user.id', $user->id)
            ->where('auth.user.name', $user->name)
            ->where('auth.user.email', $user->email)
            ->where('auth.user.is_admin', true)
        );
    });

    test('shares null auth for guest', function () {
        $response = $this->get('/');

        $response->assertInertia(fn ($page) => $page
            ->where('auth.user', null)
        );
    });

    test('shares unread notifications count', function () {
        $user = User::factory()->create();

        Notification::factory()->count(3)->create([
            'user_id' => $user->id,
            'is_read' => false,
        ]);

        Notification::factory()->count(2)->create([
            'user_id' => $user->id,
            'is_read' => true,
        ]);

        $response = $this->actingAs($user)->get('/');

        $response->assertInertia(fn ($page) => $page
            ->where('auth.user.unreadNotificationsCount', 3)
        );
    });

    test('shares zero unread notifications when none exist', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/');

        $response->assertInertia(fn ($page) => $page
            ->where('auth.user.unreadNotificationsCount', 0)
        );
    });

    test('shares unread chats count', function () {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $chat = Chat::factory()->create();
        $chat->users()->attach([$user->id, $other->id]);

        Message::factory()->count(2)->create([
            'chat_id' => $chat->id,
            'user_id' => $other->id,
            'content' => 'Hello from other user',
            'created_at' => now()->addMinute(),
        ]);

        Message::factory()->create([
            'chat_id' => $chat->id,
            'user_id' => $user->id,
            'content' => 'My own message',
            'created_at' => now()->addMinute(),
        ]);

        $response = $this->actingAs($user)->get('/');

        $response->assertInertia(fn ($page) => $page
            ->where('auth.user.unreadChatsCount', 2)
        );
    });

    test('does not count own messages as unread', function () {
        $user = User::factory()->create();

        $chat = Chat::factory()->create();
        $chat->users()->attach([$user->id]);

        Message::factory()->count(5)->create([
            'chat_id' => $chat->id,
            'user_id' => $user->id,
            'content' => 'My message',
            'created_at' => now()->addMinute(),
        ]);

        $response = $this->actingAs($user)->get('/');

        $response->assertInertia(fn ($page) => $page
            ->where('auth.user.unreadChatsCount', 0)
        );
    });

    test('shares flash message from session', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->withSession(['message' => 'Test flash message'])
            ->get('/');

        $response->assertInertia(fn ($page) => $page
            ->has('flash.message')
        );
    });

    test('shares user balance', function () {
        $user = User::factory()->create(['balance' => 99999.99]);

        $response = $this->actingAs($user)->get('/');

        $response->assertInertia(fn ($page) => $page
            ->has('auth.user')
            ->where('auth.user.balance', 99999.99)
        );
    });

    test('shares user avatar', function () {
        $user = User::factory()->create(['avatar' => 'avatars/test.jpg']);

        $response = $this->actingAs($user)->get('/');

        $response->assertInertia(fn ($page) => $page
            ->has('auth.user')
            ->where('auth.user.avatar', 'avatars/test.jpg')
        );
    });
});
