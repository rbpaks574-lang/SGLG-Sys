<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Barangay;
use App\Models\Category;
use App\Models\Deadline;
use App\Models\Notification;
use App\Models\Submission;
use App\Models\SubmissionChecklist;
use App\Models\SubmissionFile;
use App\Models\SubmissionReview;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class SubmissionController extends Controller
{
    /**
     * Display list of submissions (Queue for Checkers / Overview for Admin / Submitter).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = Submission::with(['barangay', 'category', 'user', 'files', 'checklists', 'reviews.checker']);

        // If user is a barangay user, scope to their barangay
        if ($user->isBarangay() && $user->barangay_id) {
            $query->where('barangay_id', $user->barangay_id);
        }

        // Search filter (Title or Barangay Name)
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('barangay', fn ($bq) => $bq->where('name', 'like', "%{$search}%"));
            });
        }

        // Status Filter (All Status, pending, under_review, verified, returned, forwarded)
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        // Category Filter
        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category_id', $request->input('category'));
        }

        // Barangay Filter
        if ($request->filled('barangay') && $request->input('barangay') !== 'all') {
            $query->where('barangay_id', $request->input('barangay'));
        }

        // Date Sorting (Latest / Oldest)
        $dateSort = $request->input('sort', 'latest');
        if ($dateSort === 'oldest') {
            $query->orderBy('submitted_at', 'asc');
        } else {
            $query->orderBy('submitted_at', 'desc');
        }

        // 14 items per page as explicitly requested
        $submissions = $query->paginate(14)->withQueryString();

        $barangays = Barangay::orderBy('name')->get(['id', 'name', 'code']);
        $categories = Category::orderBy('name')->get(['id', 'name', 'code', 'icon']);

        return Inertia::render('submissions/index', [
            'submissions' => $submissions,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
                'category' => $request->input('category', 'all'),
                'barangay' => $request->input('barangay', 'all'),
                'sort' => $dateSort,
            ],
            'barangays' => $barangays,
            'categories' => $categories,
            'canReview' => $user->isAdmin() || $user->isChecker(),
        ]);
    }

    /**
     * Submission creation interface:
     * 6 SGLGB core area cards on the left, submission form on the right.
     */
    public function create(Request $request): Response
    {
        $user = $request->user()->load('barangay');

        $categories = Category::with(['documentRequirements', 'deadlines' => function ($q) {
            $q->orderBy('due_date');
        }])->get();

        return Inertia::render('submissions/create', [
            'categories' => $categories,
            'userBarangay' => $user->barangay,
        ]);
    }

    /**
     * Store a new submission with multi-file uploads and checklists.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $barangayId = $user->barangay_id ?? Barangay::first()?->id;

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'deadline_id' => 'nullable|exists:deadlines,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'requirements' => 'nullable|array',
            'files' => 'required|array|min:1',
            'files.*' => 'file|max:25600', // max 25MB per file
        ]);

        $category = Category::findOrFail($request->category_id);
        $deadline = null;
        if ($request->filled('deadline_id')) {
            $deadline = Deadline::where('id', $request->deadline_id)->where('category_id', $category->id)->first();
        }
        if (! $deadline) {
            $deadline = Deadline::where('category_id', $category->id)->latest('due_date')->first();
        }

        $isLate = false;
        if ($deadline && Carbon::now()->isAfter($deadline->due_date)) {
            $isLate = true;
        }

        $submission = Submission::create([
            'barangay_id' => $barangayId,
            'user_id' => $user->id,
            'category_id' => $category->id,
            'deadline_id' => $deadline?->id,
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'pending',
            'score' => 0.00,
            'is_late' => $isLate,
            'submitted_at' => now(),
        ]);

        // Upload and store attached files
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $uploadedFile) {
                $originalName = $uploadedFile->getClientOriginalName();
                $extension = strtolower($uploadedFile->getClientOriginalExtension());
                $mimeType = $uploadedFile->getMimeType();
                $size = $uploadedFile->getSize();

                $fileType = match (true) {
                    in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif']) => 'image',
                    in_array($extension, ['pdf']) => 'pdf',
                    in_array($extension, ['doc', 'docx']) => 'docs',
                    in_array($extension, ['xls', 'xlsx']) => 'excel',
                    default => 'file',
                };

                $path = $uploadedFile->store("submissions/{$submission->id}", 'public');

                SubmissionFile::create([
                    'submission_id' => $submission->id,
                    'original_name' => $originalName,
                    'file_path' => $path,
                    'file_size' => $size,
                    'file_type' => $fileType,
                    'mime_type' => $mimeType,
                ]);
            }
        }

        // Attach checklist items
        $submittedReqs = $request->input('requirements', []);
        $allReqs = $category->documentRequirements;

        foreach ($allReqs as $req) {
            $isChecked = in_array($req->name, $submittedReqs);
            SubmissionChecklist::create([
                'submission_id' => $submission->id,
                'requirement_name' => $req->name,
                'is_checked' => $isChecked,
                'checked_by' => $isChecked ? $user->id : null,
                'checked_at' => $isChecked ? now() : null,
            ]);
        }

        // Create Audit Log
        AuditLog::log(
            'SUBMISSION_CREATED',
            "Barangay {$user->barangay?->name} submitted compliance document: \"{$submission->title}\" under {$category->name}.",
            'Submission',
            $submission->id,
            $user
        );

        // Notify DILG Checkers
        $checkers = User::whereIn('role', ['checker', 'admin'])->get();
        foreach ($checkers as $checker) {
            Notification::create([
                'user_id' => $checker->id,
                'title' => 'New Submission Received',
                'message' => "Barangay {$user->barangay?->name} submitted \"{$submission->title}\" for review.",
                'type' => 'info',
                'link' => "/submissions/{$submission->id}",
            ]);
        }

        return redirect()->route('submissions.index')->with('success', 'Submission uploaded successfully! DILG Validators have been notified.');
    }

    /**
     * Show submission details / Review modal endpoint.
     */
    public function show(Submission $submission): Response
    {
        $submission->load([
            'barangay',
            'user',
            'category.documentRequirements',
            'deadline',
            'files',
            'checklists',
            'reviews.checker',
            'verifier',
        ]);

        return Inertia::render('submissions/show', [
            'submission' => $submission,
        ]);
    }

    /**
     * Process review from Checker or Admin:
     * - Approve & Verify (with score)
     * - Return with Remarks (requires comments)
     * - Mark Under Review
     * - Forward to Admin
     */
    public function review(Request $request, Submission $submission): RedirectResponse
    {
        $user = $request->user();

        if (! ($user->isAdmin() || $user->isChecker())) {
            abort(403, 'Unauthorized. Only Checkers and Admins can evaluate submissions.');
        }

        $request->validate([
            'action' => 'required|in:verified,returned,under_review,forwarded',
            'remarks' => 'nullable|string',
            'checklists' => 'nullable|array',
        ]);

        $action = $request->action;
        $remarks = $request->remarks;

        if ($action === 'returned' && empty(trim($remarks ?? ''))) {
            return back()->withErrors(['remarks' => 'Remarks are required when returning a submission for correction.']);
        }

        // Update checklists if provided
        if ($request->has('checklists')) {
            foreach ($request->input('checklists') as $reqName => $checked) {
                SubmissionChecklist::updateOrCreate(
                    ['submission_id' => $submission->id, 'requirement_name' => $reqName],
                    [
                        'is_checked' => (bool) $checked,
                        'checked_by' => (bool) $checked ? $user->id : null,
                        'checked_at' => (bool) $checked ? now() : null,
                    ]
                );
            }
        }

        // Automated scoring: based on verified checklist items with substantial penalty deduction if late
        $submission->load(['checklists', 'category.documentRequirements']);
        $totalReqs = $submission->category?->documentRequirements?->count() ?? 0;
        if ($totalReqs === 0) {
            $totalReqs = $submission->checklists->count();
        }

        $checkedCount = $submission->checklists->where('is_checked', true)->count();
        $baseScore = $totalReqs > 0 ? round(($checkedCount / $totalReqs) * 100, 2) : 100.00;
        $lateDeduction = $submission->is_late ? 20.00 : 0.00;
        $automatedScore = max(0.00, round($baseScore - $lateDeduction, 2));

        $finalScore = ($action === 'verified') ? $automatedScore : 0.00;

        // Update submission status and score
        $submission->status = $action;
        $submission->score = $finalScore;

        if ($action === 'verified') {
            $submission->verified_at = now();
            $submission->verified_by = $user->id;

            // Recalculate Barangay compliance score
            $avgScore = Submission::where('barangay_id', $submission->barangay_id)
                ->where('status', 'verified')
                ->avg('score') ?? $finalScore;

            $submission->barangay->update([
                'compliance_score' => round($avgScore, 2),
            ]);
        } elseif ($action === 'returned') {
            $submission->score = 0.00;
        }

        $submission->save();

        // Create review record
        SubmissionReview::create([
            'submission_id' => $submission->id,
            'checker_id' => $user->id,
            'action' => $action,
            'remarks' => $remarks ?? ($action === 'verified' ? 'Submission meets all SGLGB compliance criteria.' : 'Status updated to '.$action),
        ]);

        // Send notification to Barangay Submitter
        $notifType = match ($action) {
            'verified' => 'success',
            'returned' => 'error',
            default => 'info',
        };

        $notifTitle = match ($action) {
            'verified' => 'Submission Approved & Verified',
            'returned' => 'Submission Returned for Correction',
            'forwarded' => 'Submission Forwarded to DILG MLGOO',
            default => 'Submission Under Review',
        };

        Notification::create([
            'user_id' => $submission->user_id,
            'barangay_id' => $submission->barangay_id,
            'title' => $notifTitle,
            'message' => "Validator {$user->name} updated \"{$submission->title}\": ".($remarks ?: "Marked as {$action}"),
            'type' => $notifType,
            'link' => "/submissions/{$submission->id}",
        ]);

        // Audit log
        AuditLog::log(
            'SUBMISSION_EVALUATED',
            "Checker {$user->name} marked \"{$submission->title}\" ({$submission->barangay->name}) as {$action} with score {$submission->score}%.",
            'Submission',
            $submission->id,
            $user
        );

        $msg = match ($action) {
            'verified' => 'Submission has been approved and verified successfully!',
            'returned' => 'Submission returned to Barangay with remarks.',
            'forwarded' => 'Submission forwarded to DILG MLGOO Evaluator.',
            default => 'Submission status marked as Under Review.',
        };

        return back()->with('success', $msg);
    }

    /**
     * History page for Barangay Submitters
     */
    public function history(Request $request): Response
    {
        $user = $request->user();
        $barangayId = $user->barangay_id ?? Barangay::first()?->id;

        $query = Submission::with(['category', 'files', 'reviews.checker'])
            ->where('barangay_id', $barangayId);

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category_id', $request->input('category'));
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%'.$request->input('search').'%');
        }

        $submissions = $query->latest('submitted_at')->paginate(14)->withQueryString();
        $categories = Category::all();

        return Inertia::render('history/index', [
            'submissions' => $submissions,
            'categories' => $categories,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
                'category' => $request->input('category', 'all'),
            ],
        ]);
    }
}
