<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = AuditLog::with('user');

        // If user is a barangay user, scope to their actions
        if ($user->isBarangay()) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('entity_type', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->input('date'));
        }

        $logs = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('logs/index', [
            'logs' => $logs,
            'filters' => [
                'search' => $request->input('search', ''),
                'date' => $request->input('date', ''),
            ],
            'isAdmin' => $user->isAdmin(),
        ]);
    }
}
