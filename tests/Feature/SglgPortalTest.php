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

test('checker can review and approve a submission with automated score', function () {
    $checker = User::where('role', 'checker')->first();
    $submission = Submission::where('status', 'pending')->first();

    if ($submission) {
        $reqName = $submission->checklists->first()?->requirement_name ?? 'Document';
        $response = $this->actingAs($checker)->post("/submissions/{$submission->id}/review", [
            'action' => 'verified',
            'remarks' => 'All requirements properly attached and verified.',
            'checklists' => [$reqName => true],
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('submissions', [
            'id' => $submission->id,
            'status' => 'verified',
        ]);
        expect($submission->fresh()->score)->toBeGreaterThan(0.0);
    }
});

test('barangay secretary can update secretary name and profile details', function () {
    $user = User::where('role', 'barangay')->first();
    $barangay = $user->barangay ?? Barangay::first();

    $response = $this->actingAs($user)->put("/barangays/{$barangay->id}", [
        'captain_name' => 'Hon. Captain Test',
        'secretary_name' => 'Sec. Maria Santos',
        'contact_number' => '0917-123-4567',
        'pollution_status' => 'Low / Managed',
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('barangays', [
        'id' => $barangay->id,
        'secretary_name' => 'Sec. Maria Santos',
    ]);
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
