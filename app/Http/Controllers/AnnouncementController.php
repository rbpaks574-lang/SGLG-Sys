<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\AuditLog;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Announcement::with('user');

        if ($user->isBarangay()) {
            $query->whereIn('target_role', ['all', 'barangay']);
        } elseif ($user->isChecker()) {
            $query->whereIn('target_role', ['all', 'checker']);
        }

        $announcements = $query->orderByDesc('is_pinned')
            ->latest()
            ->paginate(12);

        return Inertia::render('announcements/index', [
            'announcements' => $announcements,
            'canManage' => $user->isAdmin(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'target_role' => 'required|in:all,barangay,checker',
            'is_pinned' => 'boolean',
            'attachment' => 'nullable|file|max:20480',
        ]);

        $attachmentPath = null;
        $attachmentName = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentName = $file->getClientOriginalName();
            $attachmentPath = $file->store('announcements', 'public');
        }

        $announcement = Announcement::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'content' => $request->content,
            'target_role' => $request->target_role,
            'is_pinned' => $request->boolean('is_pinned', false),
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
        ]);

        AuditLog::log(
            'ANNOUNCEMENT_CREATED',
            "Admin broadcasted announcement: \"{$announcement->title}\" (Target: {$announcement->target_role}).",
            'Announcement',
            $announcement->id,
            $user
        );

        // Broadcast notifications
        $targetUsers = match ($announcement->target_role) {
            'barangay' => User::where('role', 'barangay')->get(),
            'checker' => User::where('role', 'checker')->get(),
            default => User::where('id', '!=', $user->id)->get(),
        };

        foreach ($targetUsers as $tu) {
            Notification::create([
                'user_id' => $tu->id,
                'title' => 'New DILG Announcement: '.$announcement->title,
                'message' => substr($announcement->content, 0, 120).'...',
                'type' => 'info',
                'link' => '/announcements',
            ]);
        }

        return back()->with('success', 'Announcement published and broadcasted successfully!');
    }

    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'target_role' => 'required|in:all,barangay,checker',
            'is_pinned' => 'boolean',
            'attachment' => 'nullable|file|max:20480',
        ]);

        $updateData = [
            'title' => $request->title,
            'content' => $request->content,
            'target_role' => $request->target_role,
            'is_pinned' => $request->boolean('is_pinned', false),
        ];

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $updateData['attachment_name'] = $file->getClientOriginalName();
            $updateData['attachment_path'] = $file->store('announcements', 'public');
        }

        $announcement->update($updateData);

        AuditLog::log(
            'ANNOUNCEMENT_UPDATED',
            "Admin updated announcement \"{$announcement->title}\".",
            'Announcement',
            $announcement->id,
            $user
        );

        return back()->with('success', 'Announcement updated successfully.');
    }

    public function destroy(Request $request, Announcement $announcement): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        $title = $announcement->title;
        $announcement->delete();

        AuditLog::log(
            'ANNOUNCEMENT_DELETED',
            "Admin deleted announcement \"{$title}\".",
            'Announcement',
            null,
            $user
        );

        return back()->with('success', 'Announcement deleted successfully.');
    }
}
