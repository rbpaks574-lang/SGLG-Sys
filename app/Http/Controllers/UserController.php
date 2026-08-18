<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Barangay;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Users list for Admin with search, role filters, 15 items per page.
     */
    public function index(Request $request): Response
    {
        $query = User::with('barangay');

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhereHas('barangay', fn ($bq) => $bq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('role') && $request->input('role') !== 'all') {
            $query->where('role', $request->input('role'));
        }

        $users = $query->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $barangays = Barangay::orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('users/index', [
            'users' => $users,
            'barangays' => $barangays,
            'filters' => [
                'search' => $request->input('search', ''),
                'role' => $request->input('role', 'all'),
            ],
        ]);
    }

    /**
     * Store new User (Admin, Checker, or Barangay Submitter).
     */
    public function store(Request $request): RedirectResponse
    {
        // Compute full name if first_name & last_name provided
        if ($request->filled('first_name') && $request->filled('last_name')) {
            $mi = trim($request->input('middle_initial', ''));
            $miFormatted = $mi !== '' ? (str_ends_with($mi, '.') ? " {$mi}" : " {$mi}.") : '';
            $request->merge([
                'name' => trim($request->input('first_name')).$miFormatted.' '.trim($request->input('last_name')),
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'first_name' => 'nullable|string|max:100',
            'middle_initial' => 'nullable|string|max:10',
            'last_name' => 'nullable|string|max:100',
            'username' => 'required|string|max:100|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:50',
            'role' => 'required|in:admin,checker,barangay',
            'barangay_id' => 'nullable|required_if:role,barangay|exists:barangays,id',
            'password' => 'required|string|min:6|confirmed',
            'is_active' => 'boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'barangay_id' => $validated['role'] === 'barangay' ? $validated['barangay_id'] : null,
            'password' => Hash::make($validated['password']),
            'is_active' => $request->boolean('is_active', true),
            'email_verified_at' => now(),
        ]);

        AuditLog::log(
            'USER_CREATED',
            "Admin created user account \"{$user->name}\" with role [{$user->role}].",
            'User',
            $user->id,
            $request->user()
        );

        return back()->with('success', "User \"{$user->name}\" created successfully.");
    }

    /**
     * Update user details and optionally change password.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        // Compute full name if first_name & last_name provided
        if ($request->filled('first_name') && $request->filled('last_name')) {
            $mi = trim($request->input('middle_initial', ''));
            $miFormatted = $mi !== '' ? (str_ends_with($mi, '.') ? " {$mi}" : " {$mi}.") : '';
            $request->merge([
                'name' => trim($request->input('first_name')).$miFormatted.' '.trim($request->input('last_name')),
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'first_name' => 'nullable|string|max:100',
            'middle_initial' => 'nullable|string|max:10',
            'last_name' => 'nullable|string|max:100',
            'username' => ['required', 'string', 'max:100', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:50',
            'role' => 'required|in:admin,checker,barangay',
            'barangay_id' => 'nullable|required_if:role,barangay|exists:barangays,id',
            'password' => 'nullable|string|min:6|confirmed',
            'is_active' => 'boolean',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'barangay_id' => $validated['role'] === 'barangay' ? $validated['barangay_id'] : null,
            'is_active' => $request->boolean('is_active', true),
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        AuditLog::log(
            'USER_UPDATED',
            "Admin updated user account \"{$user->name}\" (Role: {$user->role}).",
            'User',
            $user->id,
            $request->user()
        );

        return back()->with('success', "User \"{$user->name}\" updated successfully.");
    }

    /**
     * Delete user account.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['error' => 'You cannot delete your own logged-in admin account.']);
        }

        $userName = $user->name;
        $user->delete();

        AuditLog::log(
            'USER_DELETED',
            "Admin deleted user account \"{$userName}\".",
            'User',
            null,
            $request->user()
        );

        return back()->with('success', "User \"{$userName}\" has been deleted.");
    }
}
