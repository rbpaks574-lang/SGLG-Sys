<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = Notification::where(function ($q) use ($user) {
            $q->where('user_id', $user->id);
            if ($user->barangay_id) {
                $q->orWhere('barangay_id', $user->barangay_id);
            }
        })
            ->latest()
            ->take(15)
            ->get();

        $unreadCount = Notification::where(function ($q) use ($user) {
            $q->where('user_id', $user->id);
            if ($user->barangay_id) {
                $q->orWhere('barangay_id', $user->barangay_id);
            }
        })
            ->where('is_read', false)
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function markAsRead(Notification $notification): JsonResponse
    {
        $notification->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();

        Notification::where(function ($q) use ($user) {
            $q->where('user_id', $user->id);
            if ($user->barangay_id) {
                $q->orWhere('barangay_id', $user->barangay_id);
            }
        })
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }
}
