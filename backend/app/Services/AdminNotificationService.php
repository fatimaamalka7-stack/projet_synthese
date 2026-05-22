<?php

namespace App\Services;

use App\Models\AdminNotification;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class AdminNotificationService
{
    public static function create(
        string $type,
        string $title,
        ?string $message = null,
        ?Model $notifiable = null,
        ?User $actor = null
    ): AdminNotification {
        return AdminNotification::create([
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'notifiable_type' => $notifiable ? $notifiable::class : null,
            'notifiable_id' => $notifiable?->getKey(),
            'actor_id' => $actor?->id,
        ]);
    }
}
