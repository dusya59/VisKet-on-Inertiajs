<?php

use App\Models\Application;
use App\Models\Chat;
use App\Models\Dispute;
use App\Models\Post;
use App\Models\User;
use App\Models\Vacancy;
use App\Policies\ApplicationPolicy;
use App\Policies\DisputePolicy;

function createApplicationWithParties(): array
{
    $client = User::factory()->create(['balance' => 100000]);
    $executor = User::factory()->create(['balance' => 0]);
    $randomUser = User::factory()->create();
    $post = Post::factory()->vacancy()->create(['user_id' => $client->id]);
    $vacancy = Vacancy::factory()->for('post')->create(['post_id' => $post->id]);
    $application = Application::factory()->create([
        'vacancy_id' => $vacancy->id,
        'user_id' => $executor->id,
    ]);
    $chat = Chat::factory()->create(['application_id' => $application->id]);
    $chat->users()->attach([$client->id, $executor->id]);

    return [$application, $client, $executor, $randomUser];
}

function createDisputeWithParties(): array
{
    [$application, $client, $executor, $randomUser] = createApplicationWithParties();

    $application->update(['status' => 'in_progress']);

    $dispute = Dispute::factory()->create([
        'application_id' => $application->id,
        'initiator_id' => $client->id,
        'status' => 'open',
        'chat_id' => $application->chat->id,
    ]);

    return [$dispute, $application, $client, $executor, $randomUser];
}

describe('ApplicationPolicy', function () {
    describe('view()', function () {
        test('allows client to view', function () {
            [$application, $client] = createApplicationWithParties();
            $policy = new ApplicationPolicy();

            expect($policy->view($client, $application))->toBeTrue();
        });

        test('allows executor to view', function () {
            [$application, , $executor] = createApplicationWithParties();
            $policy = new ApplicationPolicy();

            expect($policy->view($executor, $application))->toBeTrue();
        });

        test('denies random user from viewing', function () {
            [$application, , , $randomUser] = createApplicationWithParties();
            $policy = new ApplicationPolicy();

            expect($policy->view($randomUser, $application))->toBeFalse();
        });
    });

    describe('accept()', function () {
        test('allows client to accept pending application', function () {
            [$application, $client] = createApplicationWithParties();
            $policy = new ApplicationPolicy();

            expect($policy->accept($client, $application))->toBeTrue();
        });

        test('denies executor from accepting', function () {
            [$application, , $executor] = createApplicationWithParties();
            $policy = new ApplicationPolicy();

            expect($policy->accept($executor, $application))->toBeFalse();
        });

        test('denies random user from accepting', function () {
            [$application, , , $randomUser] = createApplicationWithParties();
            $policy = new ApplicationPolicy();

            expect($policy->accept($randomUser, $application))->toBeFalse();
        });

        test('denies client from accepting non-pending application', function () {
            [$application, $client] = createApplicationWithParties();
            $application->update(['status' => 'in_progress']);
            $policy = new ApplicationPolicy();

            expect($policy->accept($client, $application))->toBeFalse();
        });
    });

    describe('reject()', function () {
        test('allows client to reject pending application', function () {
            [$application, $client] = createApplicationWithParties();
            $policy = new ApplicationPolicy();

            expect($policy->reject($client, $application))->toBeTrue();
        });

        test('denies executor from rejecting', function () {
            [$application, , $executor] = createApplicationWithParties();
            $policy = new ApplicationPolicy();

            expect($policy->reject($executor, $application))->toBeFalse();
        });

        test('denies random user from rejecting', function () {
            [$application, , , $randomUser] = createApplicationWithParties();
            $policy = new ApplicationPolicy();

            expect($policy->reject($randomUser, $application))->toBeFalse();
        });

        test('denies client from rejecting non-pending application', function () {
            [$application, $client] = createApplicationWithParties();
            $application->update(['status' => 'in_progress']);
            $policy = new ApplicationPolicy();

            expect($policy->reject($client, $application))->toBeFalse();
        });
    });

    describe('markDone()', function () {
        test('allows executor to mark done when in_progress and not yet marked', function () {
            [$application, , $executor] = createApplicationWithParties();
            $application->update(['status' => 'in_progress']);
            $policy = new ApplicationPolicy();

            expect($policy->markDone($executor, $application))->toBeTrue();
        });

        test('denies client from marking done', function () {
            [$application, $client] = createApplicationWithParties();
            $application->update(['status' => 'in_progress']);
            $policy = new ApplicationPolicy();

            expect($policy->markDone($client, $application))->toBeFalse();
        });

        test('denies executor from marking done if already marked', function () {
            [$application, , $executor] = createApplicationWithParties();
            $application->update([
                'status' => 'in_progress',
                'executor_marked_completed_at' => now(),
            ]);
            $policy = new ApplicationPolicy();

            expect($policy->markDone($executor, $application))->toBeFalse();
        });

        test('denies executor from marking done if not in_progress', function () {
            [$application, , $executor] = createApplicationWithParties();
            $policy = new ApplicationPolicy();

            expect($policy->markDone($executor, $application))->toBeFalse();
        });

        test('denies random user from marking done', function () {
            [$application, , , $randomUser] = createApplicationWithParties();
            $application->update(['status' => 'in_progress']);
            $policy = new ApplicationPolicy();

            expect($policy->markDone($randomUser, $application))->toBeFalse();
        });
    });

    describe('complete()', function () {
        test('allows client to complete when executor marked done', function () {
            [$application, $client] = createApplicationWithParties();
            $application->update([
                'status' => 'in_progress',
                'executor_marked_completed_at' => now(),
            ]);
            $policy = new ApplicationPolicy();

            expect($policy->complete($client, $application))->toBeTrue();
        });

        test('denies client from completing if executor not marked done', function () {
            [$application, $client] = createApplicationWithParties();
            $application->update(['status' => 'in_progress']);
            $policy = new ApplicationPolicy();

            expect($policy->complete($client, $application))->toBeFalse();
        });

        test('denies executor from completing', function () {
            [$application, , $executor] = createApplicationWithParties();
            $application->update([
                'status' => 'in_progress',
                'executor_marked_completed_at' => now(),
            ]);
            $policy = new ApplicationPolicy();

            expect($policy->complete($executor, $application))->toBeFalse();
        });

        test('denies random user from completing', function () {
            [$application, , , $randomUser] = createApplicationWithParties();
            $application->update([
                'status' => 'in_progress',
                'executor_marked_completed_at' => now(),
            ]);
            $policy = new ApplicationPolicy();

            expect($policy->complete($randomUser, $application))->toBeFalse();
        });
    });

    describe('cancel()', function () {
        test('allows client to cancel in_progress application', function () {
            [$application, $client] = createApplicationWithParties();
            $application->update(['status' => 'in_progress']);
            $policy = new ApplicationPolicy();

            expect($policy->cancel($client, $application))->toBeTrue();
        });

        test('allows executor to cancel in_progress application', function () {
            [$application, , $executor] = createApplicationWithParties();
            $application->update(['status' => 'in_progress']);
            $policy = new ApplicationPolicy();

            expect($policy->cancel($executor, $application))->toBeTrue();
        });

        test('allows client to cancel accepted application', function () {
            [$application, $client] = createApplicationWithParties();
            $application->update(['status' => 'accepted']);
            $policy = new ApplicationPolicy();

            expect($policy->cancel($client, $application))->toBeTrue();
        });

        test('denies random user from cancelling', function () {
            [$application, , , $randomUser] = createApplicationWithParties();
            $application->update(['status' => 'in_progress']);
            $policy = new ApplicationPolicy();

            expect($policy->cancel($randomUser, $application))->toBeFalse();
        });

        test('denies cancellation of pending application', function () {
            [$application, $client] = createApplicationWithParties();
            $policy = new ApplicationPolicy();

            expect($policy->cancel($client, $application))->toBeFalse();
        });
    });

    describe('dispute()', function () {
        test('allows client to dispute in_progress application', function () {
            [$application, $client] = createApplicationWithParties();
            $application->update(['status' => 'in_progress']);
            $policy = new ApplicationPolicy();

            expect($policy->dispute($client, $application))->toBeTrue();
        });

        test('allows executor to dispute in_progress application', function () {
            [$application, , $executor] = createApplicationWithParties();
            $application->update(['status' => 'in_progress']);
            $policy = new ApplicationPolicy();

            expect($policy->dispute($executor, $application))->toBeTrue();
        });

        test('allows client to dispute accepted application', function () {
            [$application, $client] = createApplicationWithParties();
            $application->update(['status' => 'accepted']);
            $policy = new ApplicationPolicy();

            expect($policy->dispute($client, $application))->toBeTrue();
        });

        test('denies random user from disputing', function () {
            [$application, , , $randomUser] = createApplicationWithParties();
            $application->update(['status' => 'in_progress']);
            $policy = new ApplicationPolicy();

            expect($policy->dispute($randomUser, $application))->toBeFalse();
        });

        test('denies disputing pending application', function () {
            [$application, $client] = createApplicationWithParties();
            $policy = new ApplicationPolicy();

            expect($policy->dispute($client, $application))->toBeFalse();
        });
    });

    describe('proposePrice()', function () {
        test('allows client to propose price', function () {
            [$application, $client] = createApplicationWithParties();
            $policy = new ApplicationPolicy();

            expect($policy->proposePrice($client, $application))->toBeTrue();
        });

        test('allows executor to propose price', function () {
            [$application, , $executor] = createApplicationWithParties();
            $policy = new ApplicationPolicy();

            expect($policy->proposePrice($executor, $application))->toBeTrue();
        });

        test('denies random user from proposing price', function () {
            [$application, , , $randomUser] = createApplicationWithParties();
            $policy = new ApplicationPolicy();

            expect($policy->proposePrice($randomUser, $application))->toBeFalse();
        });
    });
});

describe('DisputePolicy', function () {
    describe('view()', function () {
        test('allows admin to view', function () {
            [$dispute] = createDisputeWithParties();
            $admin = User::factory()->create(['is_admin' => true]);
            $policy = new DisputePolicy();

            expect($policy->view($admin, $dispute))->toBeTrue();
        });

        test('allows initiator to view', function () {
            [$dispute, , $client] = createDisputeWithParties();
            $policy = new DisputePolicy();

            expect($policy->view($client, $dispute))->toBeTrue();
        });

        test('allows client to view dispute they did not initiate', function () {
            [$dispute, , $client, $executor] = createDisputeWithParties();
            $dispute->update(['initiator_id' => $executor->id]);
            $policy = new DisputePolicy();

            expect($policy->view($client, $dispute))->toBeTrue();
        });

        test('allows executor to view', function () {
            [$dispute, , , $executor] = createDisputeWithParties();
            $policy = new DisputePolicy();

            expect($policy->view($executor, $dispute))->toBeTrue();
        });

        test('denies random user from viewing', function () {
            [$dispute, , , , $randomUser] = createDisputeWithParties();
            $policy = new DisputePolicy();

            expect($policy->view($randomUser, $dispute))->toBeFalse();
        });
    });

    describe('take()', function () {
        test('allows admin to take open dispute without admin', function () {
            [$dispute] = createDisputeWithParties();
            $admin = User::factory()->create(['is_admin' => true]);
            $policy = new DisputePolicy();

            expect($policy->take($admin, $dispute))->toBeTrue();
        });

        test('denies non-admin from taking', function () {
            [$dispute, , , $executor] = createDisputeWithParties();
            $policy = new DisputePolicy();

            expect($policy->take($executor, $dispute))->toBeFalse();
        });

        test('denies admin from taking already assigned dispute', function () {
            [$dispute] = createDisputeWithParties();
            $admin = User::factory()->create(['is_admin' => true]);
            $dispute->update(['admin_id' => $admin->id]);
            $policy = new DisputePolicy();

            expect($policy->take($admin, $dispute))->toBeFalse();
        });

        test('denies admin from taking resolved dispute', function () {
            [$dispute] = createDisputeWithParties();
            $admin = User::factory()->create(['is_admin' => true]);
            $dispute->update(['status' => 'resolved']);
            $policy = new DisputePolicy();

            expect($policy->take($admin, $dispute))->toBeFalse();
        });
    });

    describe('resolve()', function () {
        test('allows admin to resolve open dispute', function () {
            [$dispute] = createDisputeWithParties();
            $admin = User::factory()->create(['is_admin' => true]);
            $policy = new DisputePolicy();

            expect($policy->resolve($admin, $dispute))->toBeTrue();
        });

        test('denies non-admin from resolving', function () {
            [$dispute, , , $executor] = createDisputeWithParties();
            $policy = new DisputePolicy();

            expect($policy->resolve($executor, $dispute))->toBeFalse();
        });

        test('denies admin from resolving already resolved dispute', function () {
            [$dispute] = createDisputeWithParties();
            $admin = User::factory()->create(['is_admin' => true]);
            $dispute->update(['status' => 'resolved']);
            $policy = new DisputePolicy();

            expect($policy->resolve($admin, $dispute))->toBeFalse();
        });
    });

    describe('cancel()', function () {
        test('allows initiator to cancel open dispute', function () {
            [$dispute, , $client] = createDisputeWithParties();
            $policy = new DisputePolicy();

            expect($policy->cancel($client, $dispute))->toBeTrue();
        });

        test('allows admin to cancel open dispute', function () {
            [$dispute] = createDisputeWithParties();
            $admin = User::factory()->create(['is_admin' => true]);
            $policy = new DisputePolicy();

            expect($policy->cancel($admin, $dispute))->toBeTrue();
        });

        test('denies non-initiator non-admin from cancelling', function () {
            [$dispute, , , $executor] = createDisputeWithParties();
            $policy = new DisputePolicy();

            expect($policy->cancel($executor, $dispute))->toBeFalse();
        });

        test('denies initiator from cancelling resolved dispute', function () {
            [$dispute, , $client] = createDisputeWithParties();
            $dispute->update(['status' => 'resolved']);
            $policy = new DisputePolicy();

            expect($policy->cancel($client, $dispute))->toBeFalse();
        });
    });
});
