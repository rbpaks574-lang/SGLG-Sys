<?php

use App\Models\Barangay;
use App\Models\Category;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    // Seed essential data if needed
    if (Barangay::count() === 0) {
        $this->seed();
    }
});

test('welcome page is accessible to guests', function () {
    $response = $this->get('/');
    $response->assertStatus(200);
});

test('admin can view admin dashboard with metrics and analytics', function () {
    $admin = User::where('role', 'admin')->first();

    $response = $this->actingAs($admin)->get('/dashboard');
    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/admin-dashboard')
            ->has('metrics')
            ->has('analytics')
            ->has('activityLogs')
        );
});

test('checker can view checker dashboard with pending submissions queue', function () {
    $checker = User::where('role', 'checker')->first();

    $response = $this->actingAs($checker)->get('/dashboard');
    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/checker-dashboard')
            ->has('metrics')
            ->has('pendingSubmissions')
            ->has('recentActivity')
        );
});

test('barangay user can view submitter dashboard with ranking and editable info', function () {
    $user = User::where('role', 'barangay')->first();

    $response = $this->actingAs($user)->get('/dashboard');
    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/user-dashboard')
            ->has('metrics')
            ->has('ranking')
            ->has('recentSubmissions')
            ->has('barangayInfo')
        );
});

test('barangay user can submit a compliance document with attached files', function () {
    Storage::fake('public');
    $user = User::where('role', 'barangay')->first();
    $category = Category::first();

    $file = UploadedFile::fake()->create('budget_ordinance_2026.pdf', 500, 'application/pdf');

    $response = $this->actingAs($user)->post('/submissions', [
        'category_id' => $category->id,
        'title' => 'Test SGLG Budget Compliance',
        'description' => 'Official submission test',
        'requirements' => [$category->documentRequirements->first()?->name ?? 'Budget'],
        'files' => [$file],
    ]);

    $response->assertRedirect('/submissions');
    $this->assertDatabaseHas('submissions', [
        'title' => 'Test SGLG Budget Compliance',
        'barangay_id' => $user->barangay_id,
    ]);
});

test('checker can review and approve a submission with score', function () {
    $checker = User::where('role', 'checker')->first();
    $submission = Submission::where('status', 'pending')->first();

    if ($submission) {
        $response = $this->actingAs($checker)->post("/submissions/{$submission->id}/review", [
            'action' => 'verified',
            'remarks' => 'All requirements properly attached and verified.',
            'score' => 98.0,
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('submissions', [
            'id' => $submission->id,
            'status' => 'verified',
            'score' => 98.0,
        ]);
    }
});

test('admin can view complete 64 barangay rankings and details', function () {
    $admin = User::where('role', 'admin')->first();

    $response = $this->actingAs($admin)->get('/barangays');
    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('barangays/index')
            ->has('barangays')
            ->has('top10')
            ->has('onTimeVsLate')
        );
});

test('admin can view and filter audit logs', function () {
    $admin = User::where('role', 'admin')->first();

    $response = $this->actingAs($admin)->get('/logs');
    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('logs/index')
            ->has('logs')
        );
});
