<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Barangay;
use App\Models\Category;
use App\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BarangayController extends Controller
{
    /**
     * Complete list Ranking of all 64 Barangays for Admin.
     */
    public function index(Request $request): Response
    {
        $query = Barangay::withCount([
            'submissions as total_submissions_count',
            'submissions as verified_count' => fn ($q) => $q->where('status', 'verified'),
            'submissions as pending_count' => fn ($q) => $q->whereIn('status', ['pending', 'under_review']),
            'submissions as returned_count' => fn ($q) => $q->where('status', 'returned'),
        ]);

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('captain_name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Top 10 Performance Ranking Bar Chart
        $top10Barangays = Barangay::orderByDesc('compliance_score')
            ->take(10)
            ->get(['id', 'name', 'compliance_score'])
            ->map(fn ($b, $idx) => [
                'rank' => $idx + 1,
                'name' => $b->name,
                'score' => (float) $b->compliance_score,
            ]);

        // On-Time vs Late Submissions across all barangays
        $onTimeCount = Submission::where('is_late', false)->count();
        $lateCount = Submission::where('is_late', true)->count();

        // Complete list ranked by score desc
        $barangays = $query->orderByDesc('compliance_score')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('barangays/index', [
            'barangays' => $barangays,
            'top10' => $top10Barangays,
            'onTimeVsLate' => [
                ['label' => 'On-Time', 'value' => $onTimeCount, 'color' => '#10b981'],
                ['label' => 'Late', 'value' => $lateCount, 'color' => '#ef4444'],
            ],
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    /**
     * Show single barangay details drilldown with category breakdown.
     */
    public function show(Barangay $barangay): Response
    {
        $barangay->loadCount([
            'submissions as total_submissions_count',
            'submissions as verified_count' => fn ($q) => $q->where('status', 'verified'),
            'submissions as pending_count' => fn ($q) => $q->whereIn('status', ['pending', 'under_review']),
            'submissions as returned_count' => fn ($q) => $q->where('status', 'returned'),
        ]);

        $categories = Category::withCount([
            'submissions as total_count' => fn ($q) => $q->where('barangay_id', $barangay->id),
            'submissions as verified_count' => fn ($q) => $q->where('barangay_id', $barangay->id)->where('status', 'verified'),
        ])->get();

        $recentSubmissions = Submission::with(['category', 'files', 'reviews.checker'])
            ->where('barangay_id', $barangay->id)
            ->latest('submitted_at')
            ->take(10)
            ->get();

        return Inertia::render('barangays/show', [
            'barangay' => $barangay,
            'categories' => $categories,
            'recentSubmissions' => $recentSubmissions,
        ]);
    }

    /**
     * Inline Update Barangay Information (Captain, Contact, Pollution status).
     */
    public function update(Request $request, Barangay $barangay): RedirectResponse
    {
        $user = $request->user();

        // If user is barangay role, check they belong to this barangay
        if ($user->isBarangay() && $user->barangay_id !== $barangay->id) {
            abort(403, 'Unauthorized. You can only update your own barangay information.');
        }

        $validated = $request->validate([
            'captain_name' => 'nullable|string|max:255',
            'secretary_name' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:50',
            'pollution_status' => 'nullable|string|max:100',
            'population' => 'nullable|integer|min:0',
        ]);

        $barangay->update($validated);

        AuditLog::log(
            'BARANGAY_UPDATED',
            "User {$user->name} updated Barangay {$barangay->name} profile (Captain: {$barangay->captain_name}, Secretary: {$barangay->secretary_name}, Pollution: {$barangay->pollution_status}).",
            'Barangay',
            $barangay->id,
            $user
        );

        return back()->with('success', "Barangay {$barangay->name} details updated successfully!");
    }
}
