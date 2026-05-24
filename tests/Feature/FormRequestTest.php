<?php

use App\Http\Requests\AcceptApplicationRequest;
use App\Http\Requests\CancelApplicationRequest;
use App\Http\Requests\CompleteByClientRequest;
use App\Http\Requests\MarkCompletedRequest;
use App\Http\Requests\ResolveDisputeRequest;
use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\StoreDisputeRequest;
use App\Models\Application;
use App\Models\Chat;
use App\Models\Post;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Support\Facades\Validator;

describe('StoreApplicationRequest', function () {
    test('passes with valid data', function () {
        $data = [
            'cover_letter' => 'I am very interested in this position.',
            'proposed_price' => 50000,
        ];

        $validator = Validator::make($data, (new StoreApplicationRequest)->rules());

        expect($validator->fails())->toBeFalse();
    });

    test('fails without cover_letter', function () {
        $data = ['proposed_price' => 50000];

        $validator = Validator::make($data, (new StoreApplicationRequest)->rules());

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('cover_letter'))->toBeTrue();
    });

    test('fails with short cover_letter', function () {
        $data = ['cover_letter' => 'Short'];

        $validator = Validator::make($data, (new StoreApplicationRequest)->rules());

        expect($validator->fails())->toBeTrue();
    });

    test('passes without proposed_price', function () {
        $data = ['cover_letter' => 'I am very interested in this position.'];

        $validator = Validator::make($data, (new StoreApplicationRequest)->rules());

        expect($validator->fails())->toBeFalse();
    });

    test('fails with negative proposed_price', function () {
        $data = [
            'cover_letter' => 'I am very interested in this position.',
            'proposed_price' => -100,
        ];

        $validator = Validator::make($data, (new StoreApplicationRequest)->rules());

        expect($validator->fails())->toBeTrue();
    });

    test('authorize returns true for authenticated user', function () {
        $user = User::factory()->create();
        $this->actingAs($user);

        $request = new StoreApplicationRequest();

        expect($request->authorize())->toBeTrue();
    });

    test('authorize returns false for guest', function () {
        $request = new StoreApplicationRequest();

        expect($request->authorize())->toBeFalse();
    });
});

describe('AcceptApplicationRequest', function () {
    test('rules are empty', function () {
        $request = new AcceptApplicationRequest();

        expect($request->rules())->toBeArray()
            ->and($request->rules())->toBeEmpty();
    });

    test('authorize returns true for authenticated user', function () {
        $user = User::factory()->create();
        $this->actingAs($user);

        $request = new AcceptApplicationRequest();

        expect($request->authorize())->toBeTrue();
    });

    test('authorize returns false for guest', function () {
        $request = new AcceptApplicationRequest();

        expect($request->authorize())->toBeFalse();
    });
});

describe('CancelApplicationRequest', function () {
    test('passes with valid reason', function () {
        $data = ['reason' => 'I need to cancel this application due to personal reasons.'];

        $validator = Validator::make($data, (new CancelApplicationRequest)->rules());

        expect($validator->fails())->toBeFalse();
    });

    test('fails without reason', function () {
        $data = [];

        $validator = Validator::make($data, (new CancelApplicationRequest)->rules());

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('reason'))->toBeTrue();
    });

    test('fails with short reason', function () {
        $data = ['reason' => 'No'];

        $validator = Validator::make($data, (new CancelApplicationRequest)->rules());

        expect($validator->fails())->toBeTrue();
    });

    test('authorize returns true for authenticated user', function () {
        $user = User::factory()->create();
        $this->actingAs($user);

        $request = new CancelApplicationRequest();

        expect($request->authorize())->toBeTrue();
    });
});

describe('CompleteByClientRequest', function () {
    test('rules are empty', function () {
        $request = new CompleteByClientRequest();

        expect($request->rules())->toBeArray()
            ->and($request->rules())->toBeEmpty();
    });

    test('authorize returns true for authenticated user', function () {
        $user = User::factory()->create();
        $this->actingAs($user);

        $request = new CompleteByClientRequest();

        expect($request->authorize())->toBeTrue();
    });
});

describe('MarkCompletedRequest', function () {
    test('rules are empty', function () {
        $request = new MarkCompletedRequest();

        expect($request->rules())->toBeArray()
            ->and($request->rules())->toBeEmpty();
    });

    test('authorize returns true for authenticated user', function () {
        $user = User::factory()->create();
        $this->actingAs($user);

        $request = new MarkCompletedRequest();

        expect($request->authorize())->toBeTrue();
    });
});

describe('StoreDisputeRequest', function () {
    test('passes with valid data', function () {
        $client = User::factory()->create(['balance' => 100000]);
        $executor = User::factory()->create();
        $post = Post::factory()->vacancy()->create(['user_id' => $client->id]);
        $vacancy = Vacancy::factory()->for('post')->create(['post_id' => $post->id]);
        $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $executor->id]);

        $data = [
            'application_id' => $application->id,
            'reason' => 'The contractor did not deliver the work as agreed upon in the contract.',
        ];

        $validator = Validator::make($data, (new StoreDisputeRequest)->rules());

        expect($validator->fails())->toBeFalse();
    });

    test('fails with non-existent application_id', function () {
        $data = [
            'application_id' => 99999,
            'reason' => 'The contractor did not deliver the work as agreed upon.',
        ];

        $validator = Validator::make($data, (new StoreDisputeRequest)->rules());

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('application_id'))->toBeTrue();
    });

    test('fails without application_id', function () {
        $data = ['reason' => 'The contractor did not deliver the work as agreed upon.'];

        $validator = Validator::make($data, (new StoreDisputeRequest)->rules());

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('application_id'))->toBeTrue();
    });

    test('fails without reason', function () {
        $client = User::factory()->create(['balance' => 100000]);
        $executor = User::factory()->create();
        $post = Post::factory()->vacancy()->create(['user_id' => $client->id]);
        $vacancy = Vacancy::factory()->for('post')->create(['post_id' => $post->id]);
        $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $executor->id]);

        $data = ['application_id' => $application->id];

        $validator = Validator::make($data, (new StoreDisputeRequest)->rules());

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('reason'))->toBeTrue();
    });

    test('fails with short reason', function () {
        $client = User::factory()->create(['balance' => 100000]);
        $executor = User::factory()->create();
        $post = Post::factory()->vacancy()->create(['user_id' => $client->id]);
        $vacancy = Vacancy::factory()->for('post')->create(['post_id' => $post->id]);
        $application = Application::factory()->create(['vacancy_id' => $vacancy->id, 'user_id' => $executor->id]);

        $data = [
            'application_id' => $application->id,
            'reason' => 'Short',
        ];

        $validator = Validator::make($data, (new StoreDisputeRequest)->rules());

        expect($validator->fails())->toBeTrue();
    });

    test('authorize returns true for authenticated user', function () {
        $user = User::factory()->create();
        $this->actingAs($user);

        $request = new StoreDisputeRequest();

        expect($request->authorize())->toBeTrue();
    });
});

describe('ResolveDisputeRequest', function () {
    test('passes with valid data', function () {
        $data = [
            'resolution' => 'After reviewing both sides, I have decided to complete the transaction.',
            'outcome' => 'completed',
            'refund_amount' => 10000,
        ];

        $validator = Validator::make($data, (new ResolveDisputeRequest)->rules());

        expect($validator->fails())->toBeFalse();
    });

    test('fails without resolution', function () {
        $data = ['outcome' => 'completed'];

        $validator = Validator::make($data, (new ResolveDisputeRequest)->rules());

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('resolution'))->toBeTrue();
    });

    test('fails without outcome', function () {
        $data = ['resolution' => 'After reviewing both sides, I have decided.'];

        $validator = Validator::make($data, (new ResolveDisputeRequest)->rules());

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('outcome'))->toBeTrue();
    });

    test('fails with invalid outcome', function () {
        $data = [
            'resolution' => 'After reviewing both sides, I have decided.',
            'outcome' => 'invalid',
        ];

        $validator = Validator::make($data, (new ResolveDisputeRequest)->rules());

        expect($validator->fails())->toBeTrue();
    });

    test('passes with completed outcome', function () {
        $data = [
            'resolution' => 'After reviewing both sides, I have decided to complete.',
            'outcome' => 'completed',
        ];

        $validator = Validator::make($data, (new ResolveDisputeRequest)->rules());

        expect($validator->fails())->toBeFalse();
    });

    test('passes with cancelled outcome', function () {
        $data = [
            'resolution' => 'After reviewing both sides, I have decided to cancel.',
            'outcome' => 'cancelled',
        ];

        $validator = Validator::make($data, (new ResolveDisputeRequest)->rules());

        expect($validator->fails())->toBeFalse();
    });

    test('fails with negative refund_amount', function () {
        $data = [
            'resolution' => 'After reviewing both sides, I have decided.',
            'outcome' => 'cancelled',
            'refund_amount' => -100,
        ];

        $validator = Validator::make($data, (new ResolveDisputeRequest)->rules());

        expect($validator->fails())->toBeTrue();
    });

    test('authorize returns true for admin', function () {
        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin);

        $request = new ResolveDisputeRequest();

        expect($request->authorize())->toBeTrue();
    });

    test('authorize returns false for non-admin', function () {
        $user = User::factory()->create(['is_admin' => false]);
        $this->actingAs($user);

        $request = new ResolveDisputeRequest();

        expect($request->authorize())->toBeFalse();
    });

    test('authorize returns false for guest', function () {
        $request = new ResolveDisputeRequest();

        expect($request->authorize())->toBeFalse();
    });
});
