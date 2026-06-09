<?php

namespace App\Listeners;

use App\Events\ApplicationStatusChanged;
use App\Models\Notification;

class SendDisputeResolvedNotification
{
    public function handle(ApplicationStatusChanged $event): void
    {
        if (! in_array($event->newStatus, ['completed', 'cancelled'], true)) {
            return;
        }

        $application = $event->application;
        $parties = [$application->user, $application->vacancy->post->user];

        foreach ($parties as $party) {
            if (! $party || $party->id === $event->actor->id) {
                continue;
            }

            Notification::create([
                'user_id' => $party->id,
                'type' => 'dispute_resolved',
                'title' => 'Спор решён',
                'content' => "Администратор решил спор по вакансии \"{$application->vacancy->position}\". Решение: {$event->application->dispute?->resolution}",
                'link' => "/chats/{$application->chat?->id}",
                'is_read' => false,
            ]);
        }
    }
}
