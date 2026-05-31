<?php

use App\Models\Application;
use App\Models\Chat;
use App\Models\Comment;
use App\Models\Dispute;
use App\Models\Message;
use App\Models\Post;
use App\Models\Report;
use App\Models\Skill;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

uses()->group('controllers');

/*
|--------------------------------------------------------------------------
| HomeController
|--------------------------------------------------------------------------
*/

test('home page returns posts for guest', function () {
    $user = User::factory()->create();
    Post::factory()->count(3)->create(['user_id' => $user->id, 'active' => true]);

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Home')
        ->has('posts', 3)
    );
});

test('home page shows active posts and own inactive posts', function () {
    $user = User::factory()->create();
    Post::factory()->create(['user_id' => $user->id, 'active' => true]);
    Post::factory()->create(['user_id' => $user->id, 'active' => false]);
    Post::factory()->create(['active' => true]);

    $response = $this->actingAs($user)->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Home')
        ->has('posts', 3)
    );
});

/*
|--------------------------------------------------------------------------
| AuthController
|--------------------------------------------------------------------------
*/

test('login form renders', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Auth/Auth'));
});

test('register form renders', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Auth/Auth'));
});

test('user can register with valid data', function () {
    Storage::fake('public');

    $response = $this->post(route('register'), [
        'name' => 'testuser',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    $response->assertRedirect();
    expect(auth()->check())->toBeTrue();
});

test('user can login with valid credentials', function () {
    $user = User::factory()->create([
        'email' => 'login@test.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->post(route('login'), [
        'email' => 'login@test.com',
        'password' => 'password123',
    ]);

    $response->assertRedirect('/');
    expect(auth()->id())->toBe($user->id);
});

test('login fails with wrong password', function () {
    User::factory()->create([
        'email' => 'wrong@test.com',
        'password' => bcrypt('correct'),
    ]);

    $response = $this->post(route('login'), [
        'email' => 'wrong@test.com',
        'password' => 'wrong',
    ]);

    $response->assertSessionHasErrors('email');
    expect(auth()->check())->toBeFalse();
});

test('user can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $response->assertRedirect('/');
    expect(auth()->check())->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| PostController
|--------------------------------------------------------------------------
*/

test('post index renders for authenticated user', function () {
    $user = User::factory()->create();
    Post::factory()->count(2)->create(['active' => true]);

    $response = $this->actingAs($user)->get(route('home'));

    $response->assertOk();
});

test('user can create post with image', function () {
    $user = User::factory()->create();
    Storage::fake('public');
    $image = UploadedFile::fake()->image('post.jpg');

    $response = $this->actingAs($user)->post(route('posts.store'), [
        'title' => 'My Post',
        'description' => 'Description here',
        'image' => $image,
    ]);

    $this->assertDatabaseHas('posts', ['title' => 'My Post', 'user_id' => $user->id]);
    $response->assertRedirect();
});

test('guest redirected to login when creating post', function () {
    $response = $this->post(route('posts.store'), [
        'title' => 'My Post',
        'description' => 'Description',
        'image' => UploadedFile::fake()->image('post.jpg'),
    ]);

    $response->assertRedirect(route('login'));
});

test('post show renders with data', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id, 'active' => true]);

    $response = $this->get(route('posts.show', $post));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Posts/Show')
        ->has('post')
    );
});

test('inactive post returns 404 for other users', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id, 'active' => false]);

    $response = $this->actingAs($other)->get(route('posts.show', $post));

    $response->assertNotFound();
});

test('owner can see own inactive post', function () {
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id, 'active' => false]);

    $response = $this->actingAs($owner)->get(route('posts.show', $post));

    $response->assertOk();
});

test('user can like a post', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['active' => true]);

    $response = $this->actingAs($user)->post(route('posts.like', $post));

    $this->assertDatabaseHas('likes', ['user_id' => $user->id, 'post_id' => $post->id]);
    $response->assertRedirect();
});

test('like toggles off when already liked', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['active' => true]);
    $post->likes()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->post(route('posts.like', $post));

    $this->assertDatabaseMissing('likes', ['user_id' => $user->id, 'post_id' => $post->id]);
    $response->assertRedirect();
});

test('guest redirected to login when liking', function () {
    $post = Post::factory()->create(['active' => true]);

    $response = $this->post(route('posts.like', $post));

    $response->assertRedirect(route('login'));
});

test('user can update own post', function () {
    $user = User::factory()->create();
    Storage::fake('public');
    $post = Post::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->put(route('posts.update', $post), [
        'title' => 'Updated Title',
        'description' => 'Updated description',
    ]);

    expect($post->fresh()->title)->toBe('Updated Title');
    $response->assertRedirect();
});

test('user cannot update another users post', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);

    $response = $this->actingAs($other)->put(route('posts.update', $post), [
        'title' => 'Hacked',
        'description' => 'No',
    ]);

    $response->assertForbidden();
});

test('user can delete own post', function () {
    $user = User::factory()->create();
    Storage::fake('public');
    $post = Post::factory()->create(['user_id' => $user->id, 'image' => 'posts/test.jpg']);

    $response = $this->actingAs($user)->delete(route('posts.destroy', $post));

    $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    $response->assertRedirect();
});

test('user cannot delete another users post', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);

    $response = $this->actingAs($other)->delete(route('posts.destroy', $post));

    $response->assertForbidden();
});

test('user can create vacancy post', function () {
    $user = User::factory()->create();
    Storage::fake('public');
    $image = UploadedFile::fake()->image('vacancy.jpg');

    $response = $this->actingAs($user)->post(route('posts.store-vacancy'), [
        'position' => 'Developer',
        'image' => $image,
        'budget_min' => 1000,
        'budget_max' => 5000,
    ]);

    $this->assertDatabaseHas('posts', ['user_id' => $user->id]);
    $this->assertDatabaseHas('vacancies', ['position' => 'Developer']);
    $response->assertRedirect();
});

test('user can share post to chat', function () {
    $user = User::factory()->create();
    $recipient = User::factory()->create();
    $post = Post::factory()->create(['active' => true]);
    $chat = Chat::factory()->create();
    $chat->users()->attach([$user->id, $recipient->id]);

    $response = $this->actingAs($user)->post(route('posts.share', $post), [
        'users' => [$chat->id],
        'message' => 'Check this out!',
    ]);

    $this->assertDatabaseHas('messages', ['chat_id' => $chat->id, 'user_id' => $user->id]);
    $response->assertRedirect();
});

/*
|--------------------------------------------------------------------------
| CommentController
|--------------------------------------------------------------------------
*/

test('user can comment on post', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['active' => true]);

    $response = $this->actingAs($user)->post(route('comments.store', $post), [
        'text' => 'Great post!',
    ]);

    $this->assertDatabaseHas('comments', ['user_id' => $user->id, 'post_id' => $post->id, 'text' => 'Great post!']);
    $response->assertRedirect();
});

test('comment requires text', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['active' => true]);

    $response = $this->actingAs($user)->post(route('comments.store', $post), [
        'text' => '',
    ]);

    $response->assertSessionHasErrors('text');
});

test('user can update own comment', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['active' => true]);
    $comment = Comment::create(['user_id' => $user->id, 'post_id' => $post->id, 'text' => 'Original']);

    $response = $this->actingAs($user)->put(route('comments.update', $comment), [
        'text' => 'Updated comment',
    ]);

    expect($comment->fresh()->text)->toBe('Updated comment');
    $response->assertRedirect();
});

test('user cannot update another users comment', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->create(['active' => true]);
    $comment = Comment::create(['user_id' => $owner->id, 'post_id' => $post->id, 'text' => 'Original']);

    $response = $this->actingAs($other)->put(route('comments.update', $comment), [
        'text' => 'Hacked',
    ]);

    $response->assertForbidden();
});

test('comment author can delete own comment', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['active' => true]);
    $comment = Comment::create(['user_id' => $user->id, 'post_id' => $post->id, 'text' => 'Delete me']);

    $response = $this->actingAs($user)->delete(route('comments.destroy', $comment));

    $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
    $response->assertRedirect();
});

test('post author can delete comment on their post', function () {
    $postAuthor = User::factory()->create();
    $commenter = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $postAuthor->id, 'active' => true]);
    $comment = Comment::create(['user_id' => $commenter->id, 'post_id' => $post->id, 'text' => 'Comment']);

    $response = $this->actingAs($postAuthor)->delete(route('comments.destroy', $comment));

    $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
    $response->assertRedirect();
});

test('random user cannot delete comment', function () {
    $postAuthor = User::factory()->create();
    $commenter = User::factory()->create();
    $random = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $postAuthor->id, 'active' => true]);
    $comment = Comment::create(['user_id' => $commenter->id, 'post_id' => $post->id, 'text' => 'Comment']);

    $response = $this->actingAs($random)->delete(route('comments.destroy', $comment));

    $response->assertForbidden();
});

test('user can report comment', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['active' => true]);
    $comment = Comment::create(['user_id' => $user->id, 'post_id' => $post->id, 'text' => 'Report me']);

    $response = $this->actingAs($user)->post(route('comments.report', $comment), [
        'reason' => 'Inappropriate content',
    ]);

    $this->assertDatabaseHas('reports', ['reported_comment_id' => $comment->id, 'reason' => 'Inappropriate content']);
    $response->assertRedirect();
});

test('cannot report same comment twice', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['active' => true]);
    $comment = Comment::create(['user_id' => $user->id, 'post_id' => $post->id, 'text' => 'Report me']);
    $comment->reports()->create(['reporter_id' => $user->id, 'reason' => 'First report']);

    $response = $this->actingAs($user)->post(route('comments.report', $comment), [
        'reason' => 'Second report',
    ]);

    $response->assertSessionHas('error');
});

/*
|--------------------------------------------------------------------------
| ReportController
|--------------------------------------------------------------------------
*/

test('user can report post', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['active' => true]);

    $response = $this->actingAs($user)->post(route('posts.report', $post), [
        'reason' => 'Spam content',
    ]);

    $this->assertDatabaseHas('reports', ['reporter_id' => $user->id, 'reported_post_id' => $post->id, 'status' => 'pending']);
    $response->assertRedirect();
});

test('cannot report same post twice with pending status', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['active' => true]);
    Report::create(['reporter_id' => $user->id, 'reported_post_id' => $post->id, 'reason' => 'First', 'status' => 'pending']);

    $response = $this->actingAs($user)->post(route('posts.report', $post), [
        'reason' => 'Second report',
    ]);

    $response->assertSessionHas('error');
});

/*
|--------------------------------------------------------------------------
| ProfileController
|--------------------------------------------------------------------------
*/

test('profile show renders user data', function () {
    $user = User::factory()->create(['name' => 'ProfileUser', 'aboutme' => 'Hello world']);

    $response = $this->get(route('profile', $user));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Profile/Show')
        ->has('user')
        ->where('user.name', 'ProfileUser')
    );
});

test('profile shows own posts including inactive', function () {
    $user = User::factory()->create();
    Post::factory()->create(['user_id' => $user->id, 'active' => true]);
    Post::factory()->create(['user_id' => $user->id, 'active' => false]);

    $response = $this->actingAs($user)->get(route('profile', $user));

    $response->assertInertia(fn ($page) => $page
        ->has('posts', 2)
    );
});

test('profile hides inactive posts from other users', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    Post::factory()->create(['user_id' => $user->id, 'active' => true]);
    Post::factory()->create(['user_id' => $user->id, 'active' => false]);

    $response = $this->actingAs($other)->get(route('profile', $user));

    $response->assertInertia(fn ($page) => $page
        ->has('posts', 1)
    );
});

test('user can subscribe to another user', function () {
    $user = User::factory()->create();
    $target = User::factory()->create();

    $response = $this->actingAs($user)->post(route('subscribe', $target));

    $this->assertDatabaseHas('subscriptions', ['user_id' => $user->id, 'following_id' => $target->id]);
    $response->assertRedirect();
});

test('user can unsubscribe from another user', function () {
    $user = User::factory()->create();
    $target = User::factory()->create();
    DB::table('subscriptions')->insert(['user_id' => $user->id, 'following_id' => $target->id]);

    $response = $this->actingAs($user)->delete(route('unsubscribe', $target));

    $this->assertDatabaseMissing('subscriptions', ['user_id' => $user->id, 'following_id' => $target->id]);
    $response->assertRedirect();
});

test('profile edit returns 403 for other users', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $response = $this->actingAs($other)->get(route('profile.edit', $user));

    $response->assertForbidden();
});

test('user can update own profile', function () {
    $user = User::factory()->create();
    Storage::fake('public');

    $response = $this->actingAs($user)->put(route('profile.update', $user), [
        'name' => 'New Name',
        'aboutme' => 'New bio',
    ]);

    expect($user->fresh()->name)->toBe('New Name');
    expect($user->fresh()->aboutme)->toBe('New bio');
});

test('user cannot update another users profile', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $response = $this->actingAs($other)->put(route('profile.update', $user), [
        'name' => 'Hacked',
    ]);

    $response->assertForbidden();
});

test('user can update own avatar', function () {
    $user = User::factory()->create();
    Storage::fake('public');
    $avatar = UploadedFile::fake()->image('avatar.jpg');

    $response = $this->actingAs($user)->post(route('profile.update-avatar'), [
        'avatar' => $avatar,
    ]);

    expect($user->fresh()->avatar)->not->toBeNull();
});

test('profile following renders', function () {
    $user = User::factory()->create();

    $response = $this->get(route('following', $user));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Profile/Following'));
});

test('profile followers renders', function () {
    $user = User::factory()->create();

    $response = $this->get(route('followers', $user));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Profile/Followers'));
});

test('profile liked-posts renders', function () {
    $user = User::factory()->create();

    $response = $this->get(route('liked-posts', $user));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Profile/LikedPosts'));
});

/*
|--------------------------------------------------------------------------
| BalanceController
|--------------------------------------------------------------------------
*/

test('balance page renders with user balance', function () {
    $user = User::factory()->create(['balance' => 1500]);

    $response = $this->actingAs($user)->get(route('balance'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Balance/Index')
        ->where('balance', 1500)
    );
});

test('admin can add balance directly', function () {
    $user = User::factory()->create(['balance' => 100, 'is_admin' => true]);

    $response = $this->actingAs($user)->post(route('balance.add'), [
        'amount' => 500,
    ]);

    expect((float) $user->fresh()->balance)->toBe(600.0);
    $this->assertDatabaseHas('transactions', [
        'to_user_id' => $user->id,
        'amount' => 500,
        'type' => 'deposit',
        'status' => 'completed',
    ]);
    $response->assertRedirect();
});

test('add balance requires positive amount', function () {
    $user = User::factory()->create(['is_admin' => true]);

    $response = $this->actingAs($user)->post(route('balance.add'), [
        'amount' => -50,
    ]);

    $response->assertSessionHasErrors('amount');
});

test('user can withdraw balance', function () {
    $user = User::factory()->create(['balance' => 1000]);

    app()->bind(\App\Services\YooKassaService::class, function () {
        $mock = \Mockery::mock(\App\Services\YooKassaService::class);
        $mock->shouldReceive('createPayout')->once();
        return $mock;
    });

    $response = $this->actingAs($user)
        ->withSession(['_token' => 'test'])
        ->post(route('balance.withdraw'), [
            '_token' => 'test',
            'amount' => 300,
            'destination_type' => 'bank_card',
            'card_number' => '5555555555554477',
        ]);

    $response->assertStatus(302);

    expect((float) $user->fresh()->balance)->toBe(700.0);
    $this->assertDatabaseHas('transactions', [
        'from_user_id' => $user->id,
        'amount' => 300,
        'type' => 'withdrawal',
        'status' => 'pending',
    ]);
    $response->assertRedirect();
});

test('cannot withdraw more than balance', function () {
    $user = User::factory()->create(['balance' => 100]);

    $response = $this->actingAs($user)->post(route('balance.withdraw'), [
        'amount' => 200,
        'destination_type' => 'bank_card',
        'card_number' => '5555555555554477',
    ]);

    expect((float) $user->fresh()->balance)->toBe(100.0);
    $response->assertSessionHas('error');
});

/*
|--------------------------------------------------------------------------
| ChatController
|--------------------------------------------------------------------------
*/

test('user can start new chat', function () {
    $user = User::factory()->create();
    $target = User::factory()->create();

    $response = $this->actingAs($user)->get(route('chats.start', $target));

    $this->assertDatabaseHas('chat_user', ['user_id' => $user->id]);
    $this->assertDatabaseHas('chat_user', ['user_id' => $target->id]);
    $response->assertRedirect();
});

test('start chat reuses existing chat', function () {
    $user = User::factory()->create();
    $target = User::factory()->create();
    $chat = Chat::factory()->create();
    $chat->users()->attach([$user->id, $target->id]);

    $response = $this->actingAs($user)->get(route('chats.start', $target));

    expect(Chat::whereHas('users', fn ($q) => $q->whereIn('user_id', [$user->id, $target->id]))->count())->toBe(1);
    $response->assertRedirect();
});

test('chat index renders for authenticated user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('chats.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Chat/Chats'));
});

test('chat show renders for participant', function () {
    $user = User::factory()->create();
    $chat = Chat::factory()->create();
    $chat->users()->attach($user->id);

    $response = $this->actingAs($user)->get(route('chat', $chat));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Chat/Chats'));
});

test('chat show forbidden for non-participant', function () {
    $user = User::factory()->create();
    $chat = Chat::factory()->create();

    $response = $this->actingAs($user)->get(route('chat', $chat));

    $response->assertForbidden();
});

test('user can send message in chat', function () {
    $user = User::factory()->create();
    $recipient = User::factory()->create();
    $chat = Chat::factory()->create();
    $chat->users()->attach([$user->id, $recipient->id]);

    $response = $this->actingAs($user)->post(route('chats.messages.store', $chat), [
        'content' => 'Hello!',
    ]);

    $this->assertDatabaseHas('messages', ['chat_id' => $chat->id, 'user_id' => $user->id, 'content' => 'Hello!']);
    $response->assertRedirect();
});

test('non-participant cannot send message', function () {
    $user = User::factory()->create();
    $chat = Chat::factory()->create();

    $response = $this->actingAs($user)->post(route('chats.messages.store', $chat), [
        'content' => 'Hello!',
    ]);

    $response->assertForbidden();
});

test('user can delete own message', function () {
    $user = User::factory()->create();
    $chat = Chat::factory()->create();
    $chat->users()->attach($user->id);
    $message = Message::create(['chat_id' => $chat->id, 'user_id' => $user->id, 'content' => 'Delete me']);

    $response = $this->actingAs($user)->delete(route('chats.messages.delete', [$chat, $message]));

    $this->assertDatabaseMissing('messages', ['id' => $message->id]);
    $response->assertRedirect();
});

test('user cannot delete another users message', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $chat = Chat::factory()->create();
    $chat->users()->attach([$owner->id, $other->id]);
    $message = Message::create(['chat_id' => $chat->id, 'user_id' => $owner->id, 'content' => 'Mine']);

    $response = $this->actingAs($other)->delete(route('chats.messages.delete', [$chat, $message]));

    $response->assertForbidden();
});

test('chat search returns results', function () {
    $user = User::factory()->create();
    $target = User::factory()->create(['name' => 'SearchTarget']);
    $chat = Chat::factory()->create();
    $chat->users()->attach([$user->id, $target->id]);

    $response = $this->actingAs($user)->get(route('chats.search', ['q' => 'SearchTarget']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Chat/Chats')
        ->has('searchResults')
    );
});

test('chat search returns empty for short query', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('chats.search', ['q' => 'a']));

    $response->assertInertia(fn ($page) => $page
        ->component('Chat/Chats')
        ->where('searchResults', [])
    );
});

/*
|--------------------------------------------------------------------------
| ApplicationController
|--------------------------------------------------------------------------
*/

test('user can respond to open vacancy', function () {
    $client = User::factory()->create();
    $freelancer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'open']);

    $response = $this->actingAs($freelancer)->post(route('vacancies.respond', $vacancy), [
        'cover_letter' => 'I am interested',
        'proposed_price' => 5000,
    ]);

    $this->assertDatabaseHas('applications', ['vacancy_id' => $vacancy->id, 'user_id' => $freelancer->id, 'status' => 'pending']);
    $this->assertDatabaseHas('chats', ['application_id' => Application::where('vacancy_id', $vacancy->id)->first()->id]);
});

test('cannot respond to closed vacancy', function () {
    $client = User::factory()->create();
    $freelancer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'closed']);

    $response = $this->actingAs($freelancer)->post(route('vacancies.respond', $vacancy), [
        'cover_letter' => 'I am interested',
        'proposed_price' => 5000,
    ]);

    $response->assertSessionHas('error');
});

test('owner cannot respond to own vacancy', function () {
    $client = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'open']);

    $response = $this->actingAs($client)->post(route('vacancies.respond', $vacancy), [
        'cover_letter' => 'I am interested',
        'proposed_price' => 5000,
    ]);

    $response->assertSessionHas('error');
});

test('client can accept application', function () {
    $client = User::factory()->create(['balance' => 10000]);
    $freelancer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'open']);
    $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $freelancer->id, 'status' => 'pending', 'proposed_price' => 5000]);

    $response = $this->actingAs($client)->post(route('applications.accept', $application));

    expect($application->fresh()->status)->toBe('in_progress');
    $this->assertDatabaseHas('transactions', ['application_id' => $application->id, 'status' => 'pending']);
});

test('non-owner cannot accept application', function () {
    $client = User::factory()->create(['balance' => 10000]);
    $freelancer = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'open']);
    $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $freelancer->id, 'status' => 'pending', 'proposed_price' => 5000]);

    $response = $this->actingAs($other)->post(route('applications.accept', $application));

    $response->assertForbidden();
});

test('client can reject application', function () {
    $client = User::factory()->create();
    $freelancer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'open']);
    $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $freelancer->id, 'status' => 'pending']);

    $response = $this->actingAs($client)->post(route('applications.reject', $application));

    expect($application->fresh()->status)->toBe('rejected');
    $response->assertRedirect();
});

test('non-owner cannot reject application', function () {
    $client = User::factory()->create();
    $freelancer = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'open']);
    $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $freelancer->id, 'status' => 'pending']);

    $response = $this->actingAs($other)->post(route('applications.reject', $application));

    $response->assertForbidden();
});

test('executor can mark work as done', function () {
    $client = User::factory()->create(['balance' => 10000]);
    $freelancer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'open']);
    $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $freelancer->id, 'status' => 'pending', 'proposed_price' => 5000]);

    // First accept to get to in_progress
    $this->actingAs($client)->post(route('applications.accept', $application));

    $response = $this->actingAs($freelancer)->post(route('applications.mark-completed', $application));

    expect($application->fresh()->executor_marked_completed_at)->not->toBeNull();
    $response->assertRedirect();
});

test('client can confirm completion', function () {
    $client = User::factory()->create(['balance' => 10000]);
    $freelancer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'open']);
    $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $freelancer->id, 'status' => 'pending', 'proposed_price' => 5000]);

    // Accept -> markDone -> confirm
    $this->actingAs($client)->post(route('applications.accept', $application));
    $this->actingAs($freelancer)->post(route('applications.mark-completed', $application));

    $response = $this->actingAs($client)->post(route('applications.confirm-completion', $application));

    expect($application->fresh()->status)->toBe('completed');
    $response->assertRedirect();
});

test('client can cancel application', function () {
    $client = User::factory()->create(['balance' => 10000]);
    $freelancer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'open']);
    $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $freelancer->id, 'status' => 'pending', 'proposed_price' => 5000]);

    // First accept to get to in_progress (cancel requires in_progress or accepted)
    $this->actingAs($client)->post(route('applications.accept', $application));

    $response = $this->actingAs($client)->post(route('applications.cancel', $application), [
        'reason' => 'Changed mind',
    ]);

    expect($application->fresh()->status)->toBe('cancelled');
    $response->assertRedirect();
});

test('client can close vacancy via application', function () {
    $client = User::factory()->create();
    $freelancer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'open']);
    $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $freelancer->id, 'status' => 'in_progress']);

    $response = $this->actingAs($client)->post(route('applications.close-vacancy', $application));

    expect($post->fresh()->status)->toBe('closed');
    expect($post->fresh()->active)->toBeFalse();
    $response->assertRedirect();
});

test('non-owner cannot close vacancy', function () {
    $client = User::factory()->create();
    $freelancer = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'open']);
    $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $freelancer->id, 'status' => 'in_progress']);

    $response = $this->actingAs($other)->post(route('applications.close-vacancy', $application));

    $response->assertForbidden();
});

test('user can propose price in chat', function () {
    $client = User::factory()->create();
    $freelancer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'open']);
    $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $freelancer->id, 'status' => 'pending']);
    $chat = Chat::factory()->create(['application_id' => $application->id]);
    $chat->users()->attach([$client->id, $freelancer->id]);

    $response = $this->actingAs($freelancer)->post(route('applications.propose-price', $application), [
        'proposed_price' => 7000,
    ]);

    $this->assertDatabaseHas('messages', [
        'chat_id' => $chat->id,
        'is_price_proposal' => true,
        'proposed_price' => 7000,
    ]);
    $response->assertRedirect();
});

test('user can accept price proposal', function () {
    $client = User::factory()->create();
    $freelancer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'open']);
    $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $freelancer->id, 'status' => 'pending', 'proposed_price' => 5000]);
    $chat = Chat::factory()->create(['application_id' => $application->id]);
    $chat->users()->attach([$client->id, $freelancer->id]);
    $message = Message::create([
        'chat_id' => $chat->id,
        'user_id' => $freelancer->id,
        'content' => 'New price',
        'is_price_proposal' => true,
        'proposed_price' => 8000,
        'price_proposal_status' => 'pending',
    ]);

    $response = $this->actingAs($client)->post(route('messages.accept-price', $message));

    expect((float) $application->fresh()->proposed_price)->toBe(8000.0);
    expect($message->fresh()->price_proposal_status)->toBe('accepted');
    $response->assertRedirect();
});

/*
|--------------------------------------------------------------------------
| DisputeController
|--------------------------------------------------------------------------
*/

test('user can open dispute on accepted application', function () {
    $client = User::factory()->create(['balance' => 10000]);
    $freelancer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'open']);
    $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $freelancer->id, 'status' => 'accepted', 'proposed_price' => 5000]);

    $response = $this->actingAs($freelancer)->post(route('disputes.store'), [
        'application_id' => $application->id,
        'reason' => 'Work not delivered',
    ]);

    $this->assertDatabaseHas('disputes', ['application_id' => $application->id, 'status' => 'open']);
    expect($application->fresh()->status)->toBe('disputed');
    $response->assertRedirect();
});

test('user can cancel own dispute', function () {
    $client = User::factory()->create(['balance' => 10000]);
    $freelancer = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'open']);
    $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $freelancer->id, 'status' => 'accepted', 'proposed_price' => 5000]);
    $dispute = Dispute::factory()->create(['application_id' => $application->id, 'initiator_id' => $freelancer->id, 'status' => 'open']);

    $response = $this->actingAs($freelancer)->post(route('disputes.cancel', $dispute));

    expect($dispute->fresh()->status)->toBe('cancelled');
    $response->assertRedirect();
});

test('non-initiator cannot cancel dispute', function () {
    $client = User::factory()->create(['balance' => 10000]);
    $freelancer = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $client->id, 'active' => true]);
    $vacancy = Vacancy::factory()->create(['post_id' => $post->id, 'status' => 'open']);
    $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $freelancer->id, 'status' => 'accepted', 'proposed_price' => 5000]);
    $dispute = Dispute::factory()->create(['application_id' => $application->id, 'initiator_id' => $freelancer->id, 'status' => 'open']);

    $response = $this->actingAs($other)->post(route('disputes.cancel', $dispute));

    $response->assertForbidden();
});

/*
|--------------------------------------------------------------------------
| AdminController
|--------------------------------------------------------------------------
*/

test('admin dashboard renders counts', function () {
    $admin = User::factory()->create(['is_admin' => true]);

    $response = $this->actingAs($admin)->get(route('admin.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Admin/Index'));
});

test('non-admin cannot access admin dashboard', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $response = $this->actingAs($user)->get(route('admin.index'));

    $response->assertForbidden();
});

test('admin can approve verification', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $pendingUser = User::factory()->create(['is_verified' => 'pending']);

    $response = $this->actingAs($admin)->post(route('admin.users.approve', $pendingUser));

    expect($pendingUser->fresh()->is_verified)->toBe('verified');
    $response->assertJson(['success' => true]);
});

test('admin can reject verification with reason', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $pendingUser = User::factory()->create(['is_verified' => 'pending']);

    $response = $this->actingAs($admin)->post(route('admin.users.reject', $pendingUser), [
        'reason' => 'Documents unclear',
    ]);

    expect($pendingUser->fresh()->verification_attempts)->toBe(1);
    $this->assertDatabaseHas('verification_rejections', ['user_id' => $pendingUser->id, 'reason' => 'Documents unclear']);
    $response->assertJson(['success' => true]);
});

test('admin can delete post', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $post = Post::factory()->create(['active' => true]);

    $response = $this->actingAs($admin)->delete(route('admin.posts.delete', $post));

    $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    $response->assertRedirect();
});

test('admin can hide post', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $post = Post::factory()->create(['active' => true]);

    $response = $this->actingAs($admin)->post(route('admin.posts.hide', $post));

    expect($post->fresh()->active)->toBeFalse();
    $this->assertDatabaseHas('admin_notifications', ['user_id' => $post->user_id, 'type' => 'post_hidden']);
    $response->assertJson(['success' => true]);
});

test('admin can warn post owner', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $post = Post::factory()->create(['active' => true]);

    $response = $this->actingAs($admin)->post(route('admin.posts.warn', $post));

    $this->assertDatabaseHas('admin_notifications', ['user_id' => $post->user_id, 'type' => 'post_warning']);
    $response->assertJson(['success' => true]);
});

test('admin can delete user', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $user = User::factory()->create();

    $response = $this->actingAs($admin)->delete(route('admin.users.delete', $user));

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
    $response->assertJson(['success' => true]);
});

test('admin can dismiss post reports', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $reporter = User::factory()->create();
    $post = Post::factory()->create(['active' => true]);
    $report = Report::create(['reporter_id' => $reporter->id, 'reported_post_id' => $post->id, 'reason' => 'Spam', 'status' => 'pending']);

    $response = $this->actingAs($admin)->post(route('admin.posts.dismiss-reports', $post));

    expect($report->fresh()->status)->toBe('dismissed');
    $response->assertJson(['success' => true]);
});

test('admin can delete comment', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id, 'active' => true]);
    $comment = Comment::create(['user_id' => $user->id, 'post_id' => $post->id, 'text' => 'Bad comment']);

    $response = $this->actingAs($admin)->delete(route('admin.comments.delete', $comment));

    $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
    $response->assertRedirect();
});

test('admin users data returns json', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    User::factory()->count(3)->create();

    $response = $this->actingAs($admin)->get(route('admin.users'));

    $response->assertJsonStructure(['users', 'mode']);
});

test('admin posts data returns json', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    Post::factory()->count(2)->create(['active' => true]);

    $response = $this->actingAs($admin)->get(route('admin.posts'));

    $response->assertJsonStructure(['posts', 'mode']);
});

/*
|--------------------------------------------------------------------------
| SettingsController
|--------------------------------------------------------------------------
*/

test('settings redirects to profile section', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('settings'));

    $response->assertRedirect(route('settings.profile'));
});

test('settings profile renders user data', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('settings.profile'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Settings/Index')
        ->where('section', 'profile')
    );
});

test('settings privacy renders', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('settings.privacy'));

    $response->assertInertia(fn ($page) => $page
        ->component('Settings/Index')
        ->where('section', 'privacy')
    );
});

test('settings files renders with user files', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('settings.files'));

    $response->assertInertia(fn ($page) => $page
        ->component('Settings/Index')
        ->where('section', 'files')
    );
});

test('user can request verification', function () {
    $user = User::factory()->create(['is_verified' => null]);

    $response = $this->actingAs($user)->post(route('settings.request-verification'));

    expect($user->fresh()->is_verified)->toBe('pending');
    $response->assertJson(['success' => true]);
});

test('verified user cannot request verification again', function () {
    $user = User::factory()->create(['is_verified' => 'verified']);

    $response = $this->actingAs($user)->post(route('settings.request-verification'));

    $response->assertStatus(400);
    $response->assertJson(['error' => 'Account already verified']);
});

test('user can mark notification as read', function () {
    $user = User::factory()->create();
    $notification = \App\Models\Notification::create([
        'user_id' => $user->id,
        'type' => 'test',
        'title' => 'Test',
        'content' => 'Test content',
        'is_read' => false,
    ]);

    $response = $this->actingAs($user)->post(route('notifications.mark-read'), [
        'id' => $notification->id,
    ]);

    expect($notification->fresh()->is_read)->toBeTrue();
    $response->assertJson(['success' => true]);
});

test('user can mark all notifications as read', function () {
    $user = User::factory()->create();
    \App\Models\Notification::create(['user_id' => $user->id, 'type' => 'test', 'title' => 'T1', 'content' => 'C1', 'is_read' => false]);
    \App\Models\Notification::create(['user_id' => $user->id, 'type' => 'test', 'title' => 'T2', 'content' => 'C2', 'is_read' => false]);

    $response = $this->actingAs($user)->post(route('notifications.mark-read'), [
        'all' => true,
    ]);

    expect($user->unreadNotifications()->count())->toBe(0);
    $response->assertJson(['success' => true]);
});

test('notifications page renders', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('notifications'));

    $response->assertInertia(fn ($page) => $page->component('Settings/Notifications'));
});
