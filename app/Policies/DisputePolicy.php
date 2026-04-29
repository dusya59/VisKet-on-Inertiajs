<?php

namespace App\Policies;

use App\Models\Dispute;
use App\Models\User;

class DisputePolicy
{
    public function view(User $user, Dispute $dispute): bool
    {
        return $user->is_admin
            || $dispute->initiator_id === $user->id
            || $dispute->application->isClient($user)
            || $dispute->application->isExecutor($user);
    }

    public function take(User $user, Dispute $dispute): bool
    {
        return $user->is_admin && $dispute->status === 'open' && ! $dispute->admin_id;
    }

    public function resolve(User $user, Dispute $dispute): bool
    {
        return $user->is_admin && $dispute->status === 'open';
    }

    public function cancel(User $user, Dispute $dispute): bool
    {
        return ($dispute->initiator_id === $user->id || $user->is_admin)
            && $dispute->status === 'open';
    }
}
