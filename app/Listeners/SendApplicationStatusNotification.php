<?php

namespace App\Listeners;

use App\Events\ApplicationStatusChanged;
use App\Models\Notification;

class SendApplicationStatusNotification
{
    public function handle(ApplicationStatusChanged $event): void
    {
        $application = $event->application;
        $actor = $event->actor;
        $status = $event->newStatus;
        $other = $application->otherParty($actor);

        if (! $other) {
            return;
        }

        $titles = [
            'in_progress' => 'Отклик принят',
            'executor_marked_done' => 'Работа выполнена',
            'completed' => 'Сделка завершена',
            'cancelled' => 'Сделка отменена',
            'disputed' => 'Открыт спор',
        ];

        $messages = [
            'in_progress' => "{$actor->name} принял ваш отклик на вакансию \"{$application->vacancy->position}\". Сделка началась.",
            'executor_marked_done' => "{$actor->name} отметил работу по вакансии \"{$application->vacancy->position}\" как выполненную. Подтвердите завершение.",
            'completed' => "Сделка по вакансии \"{$application->vacancy->position}\" завершена.",
            'cancelled' => "Сделка по вакансии \"{$application->vacancy->position}\" отменена.",
            'disputed' => "{$actor->name} открыл спор по вакансии \"{$application->vacancy->position}\". Ожидайте решения администратора.",
        ];

        Notification::create([
            'user_id' => $other->id,
            'type' => 'application_status_changed',
            'title' => $titles[$status] ?? 'Обновление статуса',
            'content' => $messages[$status] ?? "Статус заявки изменён на {$status}.",
            'link' => "/chats/{$application->chat?->id}",
            'is_read' => false,
        ]);
    }
}
