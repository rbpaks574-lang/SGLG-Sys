<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\AuditLog;
use App\Models\Barangay;
use App\Models\Category;
use App\Models\Deadline;
use App\Models\Submission;
use App\Models\SubmissionReview;
use App\Models\User;
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
                'category_name' => $s->category?->name ?? 'General Compliance',
                'category_code' => $s->category?->code ?? 'GEN',
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
                'category_name' => $d->category?->name ?? 'General Compliance',
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

        // 1. Pillar Performance (6 Governance Areas)
        $categories = Category::all();
        $pillarPerformance = $categories->map(function ($cat) {
            $avg = Submission::where('category_id', $cat->id)
                ->where('status', 'verified')
                ->avg('score') ?? 0;
            $submissionsCount = Submission::where('category_id', $cat->id)->count();
            $verifiedCount = Submission::where('category_id', $cat->id)->where('status', 'verified')->count();

            return [
                'id' => $cat->id,
                'code' => $cat->code,
                'name' => $cat->name,
                'is_core' => (bool) $cat->is_core,
                'weight' => (float) $cat->weight,
                'avgScore' => round((float) $avg, 1),
                'totalSubmissions' => $submissionsCount,
                'verifiedCount' => $verifiedCount,
            ];
        });

        // 2. DILG SGLGB 3+1 Rule Eligibility Assessment
        $allBarangays = Barangay::with(['submissions' => fn ($q) => $q->where('status', 'verified')])->get();
        $coreCategoryIds = Category::where('is_core', true)->pluck('id')->toArray();
        $essentialCategoryIds = Category::where('is_core', false)->pluck('id')->toArray();

        $passersCount = 0;
        $nearPassersCount = 0;
        $needsActionCount = 0;

        foreach ($allBarangays as $b) {
            $passedCoreCount = 0;
            $passedEssentialCount = 0;

            foreach ($coreCategoryIds as $cId) {
                $sub = $b->submissions->where('category_id', $cId)->first();
                if ($sub && $sub->score >= 75) {
                    $passedCoreCount++;
                }
            }

            foreach ($essentialCategoryIds as $eId) {
                $sub = $b->submissions->where('category_id', $eId)->first();
                if ($sub && $sub->score >= 75) {
                    $passedEssentialCount++;
                }
            }

            if ($passedCoreCount >= 3 && $passedEssentialCount >= 1) {
                $passersCount++;
            } elseif ($passedCoreCount >= 2) {
                $nearPassersCount++;
            } else {
                $needsActionCount++;
            }
        }

        $sglgEligibility = [
            'passers' => $passersCount,
            'nearPassers' => $nearPassersCount,
            'needsAction' => $needsActionCount,
            'total' => $totalBarangays,
            'passRate' => $totalBarangays > 0 ? round(($passersCount / $totalBarangays) * 100, 1) : 0,
        ];

        // 3. Deficiency Root Cause Analytics
        $returnedRemarks = SubmissionReview::where('action', 'returned')
            ->pluck('remarks')
            ->filter();

        $deficiencyBuckets = [
            'Missing Signature / Seal' => 0,
            'Incomplete Supporting Docs' => 0,
            'Budget / Data Discrepancy' => 0,
            'Expired / Outdated Period' => 0,
            'Illegible / Blurry File' => 0,
            'Other Deficiencies' => 0,
        ];

        foreach ($returnedRemarks as $rem) {
            $remLower = strtolower($rem);
            if (str_contains($remLower, 'signature') || str_contains($remLower, 'seal') || str_contains($remLower, 'pirma')) {
                $deficiencyBuckets['Missing Signature / Seal']++;
            } elseif (str_contains($remLower, 'incomplete') || str_contains($remLower, 'kulang') || str_contains($remLower, 'supporting')) {
                $deficiencyBuckets['Incomplete Supporting Docs']++;
            } elseif (str_contains($remLower, 'budget') || str_contains($remLower, 'discrepancy') || str_contains($remLower, 'ordinance')) {
                $deficiencyBuckets['Budget / Data Discrepancy']++;
            } elseif (str_contains($remLower, 'expired') || str_contains($remLower, 'outdated') || str_contains($remLower, 'period')) {
                $deficiencyBuckets['Expired / Outdated Period']++;
            } elseif (str_contains($remLower, 'blurry') || str_contains($remLower, 'illegible') || str_contains($remLower, 'malabo')) {
                $deficiencyBuckets['Illegible / Blurry File']++;
            } else {
                $deficiencyBuckets['Other Deficiencies']++;
            }
        }

        $deficiencyColors = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899', '#64748b'];
        $colorIdx = 0;
        $deficiencyStats = [];
        foreach ($deficiencyBuckets as $label => $cnt) {
            if ($cnt > 0 || count($returnedRemarks) === 0) {
                $deficiencyStats[] = [
                    'label' => $label,
                    'value' => $cnt,
                    'color' => $deficiencyColors[$colorIdx % count($deficiencyColors)],
                ];
            }
            $colorIdx++;
        }

        // 4. Turnaround Time & Validation Speed (Database-agnostic calculation)
        $avgValidationHours = 4.5;
        $verifiedSubmissions = Submission::whereNotNull('verified_at')
            ->whereNotNull('submitted_at')
            ->get(['submitted_at', 'verified_at']);

        if ($verifiedSubmissions->isNotEmpty()) {
            $totalHours = $verifiedSubmissions->sum(function ($s) {
                return Carbon::parse($s->submitted_at)->diffInHours(Carbon::parse($s->verified_at));
            });
            $avgValidationHours = round($totalHours / $verifiedSubmissions->count(), 1);
        }

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
                'avgValidationHours' => $avgValidationHours,
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
                'pillarPerformance' => $pillarPerformance,
                'sglgEligibility' => $sglgEligibility,
                'deficiencyStats' => $deficiencyStats,
            ],
            'activityLogs' => $activityLogs,
            'announcements' => $announcements,
        ]);
    }
}
