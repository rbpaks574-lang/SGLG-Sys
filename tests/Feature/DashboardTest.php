<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('barangay user can visit the dashboard', function () {
    $user = User::factory()->create(['role' => 'barangay']);

    $response = $this
        ->actingAs($user)
        ->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard/user-dashboard')
        ->has('metrics')
        ->has('ranking')
        ->has('recentSubmissions')
    );
});

test('admin user is served the admin dashboard component', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this
        ->actingAs($admin)
        ->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard/admin-dashboard')
        ->has('metrics')
        ->has('analytics')
    );
});

test('checker user is served the checker dashboard component', function () {
    $checker = User::factory()->create(['role' => 'checker']);

    $response = $this
        ->actingAs($checker)
        ->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard/checker-dashboard')
        ->has('metrics')
        ->has('pendingSubmissions')
    );
});
