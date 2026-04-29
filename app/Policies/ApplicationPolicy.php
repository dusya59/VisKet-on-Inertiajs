<?php

namespace App\Policies;

use App\Models\Application;
use App\Models\User;

class ApplicationPolicy
{
    public function view(User $user, Application $application): bool
    {
        return $application->isClient($user) || $application->isExecutor($user);
    }

    public function accept(User $user, Application $application): bool
    {
        return $application->isClient($user) && $application->canBeAccepted();
    }

    public function reject(User $user, Application $application): bool
    {
        return $application->isClient($user) && $application->isPending();
    }

    public function markDone(User $user, Application $application): bool
    {
        return $application->isExecutor($user) && $application->canBeMarkedDoneByExecutor();
    }

    public function complete(User $user, Application $application): bool
    {
        return $application->isClient($user) && $application->canBeCompletedByClient();
    }

    public function cancel(User $user, Application $application): bool
    {
        return ($application->isClient($user) || $application->isExecutor($user))
            && $application->canBeCancelled();
    }

    public function dispute(User $user, Application $application): bool
    {
        return ($application->isClient($user) || $application->isExecutor($user))
            && $application->canBeDisputed();
    }

    public function proposePrice(User $user, Application $application): bool
    {
        return $application->isClient($user) || $application->isExecutor($user);
    }
}
