<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\AuditLog;
use App\Models\Barangay;
use App\Models\Deadline;
use App\Models\Submission;
use App\Models\SubmissionReview;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user()->load('barangay');

        if ($user->isAdmin()) {
            return $this->adminDashboard($user);
        }

        if ($user->isChecker()) {
            return $this->checkerDashboard($user);
        }

        return $this->barangayDashboard($user);
    }

    private function barangayDashboard($user): Response
    {
        $barangay = $user->barangay;

        // If user has no barangay assigned, fallback to first barangay
        if (! $barangay) {
            $barangay = Barangay::first();
        }

        $barangayId = $barangay ? $barangay->id : null;

        // 5 Metric Cards
        $totalSubmissions = Submission::where('barangay_id', $barangayId)->count();
        $pendingCount = Submission::where('barangay_id', $barangayId)->whereIn('status', ['pending', 'under_review'])->count();
        $verifiedCount = Submission::where('barangay_id', $barangayId)->where('status', 'verified')->count();
        $returnedCount = Submission::where('barangay_id', $barangayId)->where('status', 'returned')->count();
        $forwardedCount = Submission::where('barangay_id', $barangayId)->where('status', 'forwarded')->count();

        // Compliance Scores & Ranking (Top 10 + Your Rank out of 64)
        $allBarangays = Barangay::orderByDesc('compliance_score')->get();
        $top10Barangays = $allBarangays->take(10)->map(fn ($b, $idx) => [
            'rank' => $idx + 1,
            'id' => $b->id,
            'name' => $b->name,
            'score' => (float) $b->compliance_score,
            'isCurrent' => $b->id === $barangayId,
        ]);

        $yourRankIndex = $allBarangays->search(fn ($b) => $b->id === $barangayId);
        $yourRank = $yourRankIndex !== false ? $yourRankIndex + 1 : 1;
        $overallScore = $barangay ? (float) $barangay->compliance_score : 0.00;

        // Recent Submissions
        $recentSubmissions = Submission::with(['category', 'files', 'reviews.checker'])
            ->where('barangay_id', $barangayId)
            ->latest('submitted_at')
            ->take(6)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'title' => $s->title,
                'category_name' => $s->category->name,
                'category_code' => $s->category->code,
                'status' => $s->status,
                'score' => (float) $s->score,
                'submitted_at' => $s->submitted_at ? Carbon::parse($s->submitted_at)->format('M d, Y h:i A') : 'N/A',
                'files' => $s->files->map(fn ($f) => [
                    'id' => $f->id,
                    'name' => $f->original_name,
                    'type' => $f->file_type,
                    'size' => $f->file_size,
                    'url' => route('files.preview', $f->id),
                ]),
                'latest_remark' => $s->reviews->first()?->remarks,
            ]);

        // Upcoming Deadlines
        $upcomingDeadlines = Deadline::with('category')
            ->where('due_date', '>=', now()->subDays(1))
            ->orderBy('due_date')
            ->take(5)
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'category_id' => $d->category_id,
                'title' => $d->title,
                'category_name' => $d->category->name,
                'due_date' => Carbon::parse($d->due_date)->format('M d, Y h:i A'),
                'is_urgent' => Carbon::parse($d->due_date)->diffInDays(now()) <= 7,
                'target_period' => $d->target_period,
            ]);

        // Announcements
        $announcements = Announcement::whereIn('target_role', ['all', 'barangay'])
            ->orderByDesc('is_pinned')
            ->latest()
            ->take(4)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'content' => $a->content,
                'is_pinned' => $a->is_pinned,
                'attachment_name' => $a->attachment_name,
                'created_at' => Carbon::parse($a->created_at)->format('M d, Y h:i A'),
            ]);

        return Inertia::render('dashboard/user-dashboard', [
            'metrics' => [
                'total' => $totalSubmissions,
                'pending' => $pendingCount,
                'verified' => $verifiedCount,
                'returned' => $returnedCount,
                'forwarded' => $forwardedCount,
            ],
            'ranking' => [
                'top10' => $top10Barangays,
                'yourRank' => $yourRank,
                'totalBarangays' => $allBarangays->count(),
                'overallScore' => $overallScore,
            ],
            'recentSubmissions' => $recentSubmissions,
            'upcomingDeadlines' => $upcomingDeadlines,
            'announcements' => $announcements,
            'barangayInfo' => $barangay ? [
                'id' => $barangay->id,
                'name' => $barangay->name,
                'code' => $barangay->code,
                'captain_name' => $barangay->captain_name ?? 'Not set',
                'secretary_name' => $barangay->secretary_name ?? 'Not set',
                'contact_number' => $barangay->contact_number ?? 'Not set',
                'pollution_status' => $barangay->pollution_status ?? 'Low / Managed',
                'population' => $barangay->population,
            ] : null,
        ]);
    }

    private function checkerDashboard($user): Response
    {
        // 4 Metric Cards
        $pendingReviewCount = Submission::where('status', 'pending')->count();
        $underReviewCount = Submission::where('status', 'under_review')->count();
        $verifiedTodayCount = Submission::where('status', 'verified')
            ->whereDate('verified_at', Carbon::today())
            ->count();
        $returnedTodayCount = Submission::where('status', 'returned')
            ->whereDate('updated_at', Carbon::today())
            ->count();

        // Left Side: Pending Submissions Queue
        $pendingSubmissions = Submission::with(['barangay', 'category', 'files', 'checklists', 'user'])
            ->whereIn('status', ['pending', 'under_review'])
            ->latest('submitted_at')
            ->take(8)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'title' => $s->title,
                'description' => $s->description,
                'status' => $s->status,
                'score' => (float) ($s->score ?? 0),
                'is_late' => (bool) $s->is_late,
                'submitted_at' => $s->submitted_at ? Carbon::parse($s->submitted_at)->format('M d, Y h:i A') : 'N/A',
                'barangay' => [
                    'id' => $s->barangay?->id ?? 0,
                    'name' => $s->barangay?->name ?? 'DILG Office',
                    'code' => $s->barangay?->code ?? 'LGU',
                ],
                'category' => [
                    'id' => $s->category?->id ?? 0,
                    'name' => $s->category?->name ?? 'General Compliance',
                    'code' => $s->category?->code ?? 'GEN',
                ],
                'user' => [
                    'id' => $s->user?->id ?? 0,
                    'name' => $s->user?->name ?? 'Barangay Secretary',
                ],
                'files' => $s->files->map(fn ($f) => [
                    'id' => $f->id,
                    'original_name' => $f->original_name,
                    'file_type' => $f->file_type ?? 'document',
                    'file_size' => $f->file_size ?? 0,
                    'url' => route('files.preview', $f->id),
                ])->values()->all(),
                'checklists' => $s->checklists->map(fn ($c) => [
                    'id' => $c->id,
                    'requirement_name' => $c->requirement_name,
                    'is_checked' => (bool) $c->is_checked,
                ])->values()->all(),
            ]);

        // Right Side: Recent Activity
        $recentActivity = SubmissionReview::with(['submission.barangay', 'submission.category', 'checker'])
            ->latest()
            ->take(6)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'submission_id' => $r->submission_id,
                'submission_title' => $r->submission?->title ?? 'Submission #'.$r->submission_id,
                'barangay_name' => $r->submission?->barangay?->name ?? 'General',
                'checker_name' => $r->checker?->name ?? 'DILG Validator',
                'action' => $r->action,
                'remarks' => $r->remarks ?? '',
                'created_at' => $r->created_at ? Carbon::parse($r->created_at)->diffForHumans() : 'Just now',
                'submission' => [
                    'id' => $r->submission_id,
                    'title' => $r->submission?->title ?? 'Submission #'.$r->submission_id,
                    'barangay' => [
                        'name' => $r->submission?->barangay?->name ?? 'General',
                    ],
                    'category' => [
                        'name' => $r->submission?->category?->name ?? 'General',
                    ],
                ],
            ]);

        $announcements = Announcement::whereIn('target_role', ['all', 'checker'])
            ->latest()
            ->take(3)
            ->get();

        return Inertia::render('dashboard/checker-dashboard', [
            'metrics' => [
                'pendingReview' => $pendingReviewCount,
                'underReview' => $underReviewCount,
                'verifiedToday' => $verifiedTodayCount,
                'returnedToday' => $returnedTodayCount,
            ],
            'pendingSubmissions' => $pendingSubmissions,
            'recentActivity' => $recentActivity,
            'announcements' => $announcements,
        ]);
    }

    private function adminDashboard($user): Response
    {
        // 5 Metric Cards
        $totalBarangays = Barangay::count();
        $totalSubmissions = Submission::count();
        $verifiedCount = Submission::where('status', 'verified')->count();
        $pendingCount = Submission::whereIn('status', ['pending', 'under_review'])->count();
        $returnedCount = Submission::where('status', 'returned')->count();

        // Top 10 Performance Ranking (Bar Chart)
        $top10 = Barangay::orderByDesc('compliance_score')
            ->take(10)
            ->get(['id', 'name', 'compliance_score'])
            ->map(fn ($b, $idx) => [
                'rank' => $idx + 1,
                'name' => $b->name,
                'score' => (float) $b->compliance_score,
            ]);

        // Overall Compliance Rate (Pie / Donut Chart)
        $highPerformingCount = Barangay::where('compliance_score', '>=', 90)->count();
        $moderateCount = Barangay::whereBetween('compliance_score', [75, 89.99])->count();
        $needsImprovementCount = Barangay::where('compliance_score', '<', 75)->count();

        $overallComplianceRate = $totalBarangays > 0
            ? round((Barangay::avg('compliance_score') ?? 0), 1)
            : 0;

        // Submission Status Breakdown (Pie Chart)
        $forwardedCount = Submission::where('status', 'forwarded')->count();
        $submissionStatusDistribution = [
            ['label' => 'Verified', 'value' => $verifiedCount, 'color' => '#10b981'],
            ['label' => 'Returned', 'value' => $returnedCount, 'color' => '#ef4444'],
            ['label' => 'Pending / Review', 'value' => $pendingCount, 'color' => '#f59e0b'],
            ['label' => 'Forwarded', 'value' => $forwardedCount, 'color' => '#3b82f6'],
        ];

        // On-Time vs Late
        $onTimeCount = Submission::where('is_late', false)->count();
        $lateCount = Submission::where('is_late', true)->count();

        // Activity Logs
        $activityLogs = AuditLog::with('user')
            ->latest()
            ->take(7)
            ->get()
            ->map(fn ($l) => [
                'id' => $l->id,
                'user_name' => $l->user?->name ?? 'System',
                'action' => $l->action,
                'description' => $l->description,
                'time' => Carbon::parse($l->created_at)->diffForHumans(),
                'ip' => $l->ip_address,
            ]);

        // Broadcast Announcements
        $announcements = Announcement::latest()
            ->take(4)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'content' => $a->content,
                'target_role' => $a->target_role,
                'is_pinned' => $a->is_pinned,
                'attachment_name' => $a->attachment_name,
                'created_at' => Carbon::parse($a->created_at)->format('M d, Y h:i A'),
            ]);

        return Inertia::render('dashboard/admin-dashboard', [
            'metrics' => [
                'totalBarangays' => $totalBarangays,
                'totalSubmissions' => $totalSubmissions,
                'verified' => $verifiedCount,
                'pending' => $pendingCount,
                'returned' => $returnedCount,
            ],
            'analytics' => [
                'top10' => $top10,
                'overallComplianceRate' => $overallComplianceRate,
                'complianceBreakdown' => [
                    ['label' => 'Compliant (>=90%)', 'value' => $highPerformingCount, 'color' => '#10b981'],
                    ['label' => 'Moderate (75-89%)', 'value' => $moderateCount, 'color' => '#f59e0b'],
                    ['label' => 'Needs Action (<75%)', 'value' => $needsImprovementCount, 'color' => '#ef4444'],
                ],
                'statusDistribution' => $submissionStatusDistribution,
                'submissionStatusDistribution' => $submissionStatusDistribution,
                'onTimeVsLate' => [
                    ['label' => 'On-Time', 'value' => $onTimeCount, 'color' => '#10b981'],
                    ['label' => 'Late Submissions', 'value' => $lateCount, 'color' => '#ef4444'],
                ],
            ],
            'activityLogs' => $activityLogs,
            'announcements' => $announcements,
        ]);
    }
}
