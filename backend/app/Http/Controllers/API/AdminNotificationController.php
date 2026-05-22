<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;

class AdminNotificationController extends Controller
{
    public function index()
    {
        $notifications = AdminNotification::with('actor:id,name,email,role')
            ->orderByRaw('read_at is null desc')
            ->latest()
            ->paginate(20);

        return response()->json($notifications);
    }

    public function unreadCount()
    {
        return response()->json([
            'count' => AdminNotification::unread()->count(),
        ]);
    }

    public function markAsRead($id)
    {
        $notification = AdminNotification::findOrFail($id);

        if (! $notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json([
            'message' => 'Notification marquee comme lue',
            'notification' => $notification->fresh('actor:id,name,email,role'),
            'unread_count' => AdminNotification::unread()->count(),
        ]);
    }

    public function markAllAsRead()
    {
        AdminNotification::unread()->update(['read_at' => now()]);

        return response()->json([
            'message' => 'Toutes les notifications sont marquees comme lues',
            'unread_count' => 0,
        ]);
    }
}
