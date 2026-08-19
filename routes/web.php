<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentTemplateController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return inertia('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    // Main Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Submissions
    Route::get('/submissions', [SubmissionController::class, 'index'])->name('submissions.index');
    Route::get('/submissions/create', [SubmissionController::class, 'create'])->name('submissions.create');
    Route::post('/submissions', [SubmissionController::class, 'store'])->name('submissions.store');
    Route::get('/submissions/{submission}', [SubmissionController::class, 'show'])->name('submissions.show');
    Route::post('/submissions/{submission}/review', [SubmissionController::class, 'review'])->name('submissions.review');
    Route::post('/submissions/{submission}/resubmit', [SubmissionController::class, 'resubmit'])->name('submissions.resubmit');
    Route::get('/submissions/{submission}/download-zip', [SubmissionController::class, 'downloadZip'])->name('submissions.download-zip');
    Route::get('/submissions/{submission}/receipt', [SubmissionController::class, 'receipt'])->name('submissions.receipt');
    Route::get('/history', [SubmissionController::class, 'history'])->name('history.index');

    // Barangays (Complete 64 list & ranking for Admin / updates)
    Route::get('/barangays', [BarangayController::class, 'index'])->name('barangays.index');
    Route::get('/barangays/{barangay}', [BarangayController::class, 'show'])->name('barangays.show');
    Route::put('/barangays/{barangay}', [BarangayController::class, 'update'])->name('barangays.update');

    // Users Management (Admin)
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    // Announcements
    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');

    // Document Templates
    Route::get('/templates', [DocumentTemplateController::class, 'index'])->name('templates.index');
    Route::post('/templates', [DocumentTemplateController::class, 'store'])->name('templates.store');
    Route::get('/templates/{template}/download', [DocumentTemplateController::class, 'download'])->name('templates.download');
    Route::delete('/templates/{template}', [DocumentTemplateController::class, 'destroy'])->name('templates.destroy');

    // Audit / System Logs
    Route::get('/logs', [AuditLogController::class, 'index'])->name('logs.index');

    // Notifications API
    Route::get('/api/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/api/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/api/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.readAll');

    // Secure File Preview & Download
    Route::get('/files/{file}/preview', [FileController::class, 'preview'])->name('files.preview');
    Route::get('/files/{file}/download', [FileController::class, 'download'])->name('files.download');
});

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
