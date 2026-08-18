<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Notification;
use App\Models\Submission;
use App\Models\SubmissionChecklist;
use App\Models\SubmissionFile;
use App\Models\SubmissionReview;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class SubmissionSeeder extends Seeder
{
    public function run(): void
    {
        $checkers = User::where('role', 'checker')->get();
        $primaryChecker = $checkers->first();
        $admin = User::where('role', 'admin')->first();

        $categories = Category::with('documentRequirements', 'deadlines')->get();
        $barangayUsers = User::where('role', 'barangay')->with('barangay')->get();

        if ($barangayUsers->isEmpty() || $categories->isEmpty()) {
            return;
        }

        $sampleSubmissions = [
            [
                'title' => '2026 Sangguniang Barangay Approved Annual Budget Ordinance & Certified Posting',
                'category_code' => 'FIN',
                'status' => 'verified',
                'score' => 98.50,
                'is_late' => false,
                'days_ago' => 5,
                'remarks' => 'Complete attachments: Appropriation ordinance properly signed by PB & SB members, authenticated by City/Municipal budget officer.',
                'files' => [
                    ['name' => 'Barangay_Poblacion1_Approved_Budget_Ordinance_2026.pdf', 'type' => 'pdf', 'size' => 2450000, 'mime' => 'application/pdf'],
                    ['name' => 'BFDP_Posting_3Boards_Photos.jpg', 'type' => 'image', 'size' => 1840000, 'mime' => 'image/jpeg'],
                ],
            ],
            [
                'title' => 'BDRRM Emergency Equipment Inventory & Generator Readiness Inspection',
                'category_code' => 'DIS',
                'status' => 'verified',
                'score' => 96.00,
                'is_late' => false,
                'days_ago' => 4,
                'remarks' => 'Rescue equipment functional, power generator verified with 7.5kVA operational capacity.',
                'files' => [
                    ['name' => 'BDRRM_Inventory_and_Inspection_Certificate.pdf', 'type' => 'pdf', 'size' => 3120000, 'mime' => 'application/pdf'],
                    ['name' => 'Generator_Plate_and_Operation_Photos.png', 'type' => 'image', 'size' => 2200000, 'mime' => 'image/png'],
                ],
            ],
            [
                'title' => 'Q1 Katarungang Pambarangay (KP) Cases & BADAC Watchlist Monthly Progress',
                'category_code' => 'PNO',
                'status' => 'under_review',
                'score' => 0.00,
                'is_late' => false,
                'days_ago' => 2,
                'remarks' => 'Currently being reviewed for completeness of Lupon Tagapamayapa case docket entries.',
                'files' => [
                    ['name' => 'KP_Quarterly_Log_Q1_2026.pdf', 'type' => 'pdf', 'size' => 1420000, 'mime' => 'application/pdf'],
                    ['name' => 'BADAC_Watchlist_Confidential_Log.docx', 'type' => 'docs', 'size' => 890000, 'mime' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                ],
            ],
            [
                'title' => 'Barangay GAD Plan 2026 & VAWC Desk Quarterly Intake Summary',
                'category_code' => 'SOC',
                'status' => 'pending',
                'score' => 0.00,
                'is_late' => false,
                'days_ago' => 1,
                'remarks' => null,
                'files' => [
                    ['name' => 'GAD_Plan_and_Budget_Allocation_2026.pdf', 'type' => 'pdf', 'size' => 1950000, 'mime' => 'application/pdf'],
                    ['name' => 'VAWC_Quarterly_Intake_Report.pdf', 'type' => 'pdf', 'size' => 1120000, 'mime' => 'application/pdf'],
                ],
            ],
            [
                'title' => 'Q1 Solid Waste MRF Log & Community Clean-Up Accomplishment Report',
                'category_code' => 'ENV',
                'status' => 'returned',
                'score' => 0.00,
                'is_late' => false,
                'days_ago' => 3,
                'remarks' => 'Returned: Please re-upload with clear photo documentation showing before/after of the Sitio II canal clean-up drive and the signature of the Environmental Committee Chairman.',
                'files' => [
                    ['name' => 'Clean_Up_Accomplishment_Report_Q1.pdf', 'type' => 'pdf', 'size' => 3400000, 'mime' => 'application/pdf'],
                ],
            ],
            [
                'title' => 'Business Clearance Log & Ease of Doing Business (EODB) Flowchart Posting',
                'category_code' => 'BUS',
                'status' => 'forwarded',
                'score' => 95.00,
                'is_late' => false,
                'days_ago' => 6,
                'remarks' => 'Verified by Checker and forwarded to MLGOO DILG Evaluator for final accreditation.',
                'files' => [
                    ['name' => 'Business_Clearance_Masterlist_2026.pdf', 'type' => 'pdf', 'size' => 1540000, 'mime' => 'application/pdf'],
                    ['name' => 'EODB_Signage_Posting_Photos.jpg', 'type' => 'image', 'size' => 2050000, 'mime' => 'image/jpeg'],
                ],
            ],
        ];

        // Seed across barangays
        foreach ($barangayUsers as $index => $u) {
            $barangay = $u->barangay;
            if (! $barangay) {
                continue;
            }

            foreach ($sampleSubmissions as $subData) {
                $category = $categories->firstWhere('code', $subData['category_code']) ?? $categories->first();
                $deadline = $category->deadlines->first();

                $submittedAt = Carbon::now()->subDays($subData['days_ago'] + ($index % 3));
                $verifiedAt = in_array($subData['status'], ['verified', 'forwarded']) ? Carbon::parse($submittedAt)->addHours(8) : null;

                $submission = Submission::create([
                    'barangay_id' => $barangay->id,
                    'user_id' => $u->id,
                    'category_id' => $category->id,
                    'deadline_id' => $deadline?->id,
                    'title' => $subData['title'],
                    'description' => 'Official compliance submission on behalf of '.$barangay->name.' for the '.$category->name.' area.',
                    'status' => $subData['status'],
                    'score' => $subData['score'],
                    'is_late' => $subData['is_late'],
                    'submitted_at' => $submittedAt,
                    'verified_at' => $verifiedAt,
                    'verified_by' => $verifiedAt ? $primaryChecker?->id : null,
                ]);

                // Attach files
                foreach ($subData['files'] as $f) {
                    SubmissionFile::create([
                        'submission_id' => $submission->id,
                        'original_name' => $f['name'],
                        'file_path' => 'submissions/'.$submission->id.'/'.$f['name'],
                        'file_size' => $f['size'],
                        'file_type' => $f['type'],
                        'mime_type' => $f['mime'],
                    ]);
                }

                // Attach Checklist items
                foreach ($category->documentRequirements as $req) {
                    SubmissionChecklist::create([
                        'submission_id' => $submission->id,
                        'requirement_name' => $req->name,
                        'is_checked' => in_array($subData['status'], ['verified', 'forwarded']),
                        'checked_by' => in_array($subData['status'], ['verified', 'forwarded']) ? $primaryChecker?->id : null,
                        'checked_at' => in_array($subData['status'], ['verified', 'forwarded']) ? $verifiedAt : null,
                    ]);
                }

                // Add Review log if reviewed or returned
                if ($subData['remarks']) {
                    SubmissionReview::create([
                        'submission_id' => $submission->id,
                        'checker_id' => $primaryChecker?->id ?? $admin->id,
                        'action' => $subData['status'] === 'returned' ? 'returned' : ($subData['status'] === 'under_review' ? 'under_review' : 'verified'),
                        'remarks' => $subData['remarks'],
                        'created_at' => $verifiedAt ?? $submittedAt->copy()->addHours(3),
                    ]);
                }

                // Add Notification for returns or verifications
                if ($subData['status'] === 'returned') {
                    Notification::create([
                        'user_id' => $u->id,
                        'barangay_id' => $barangay->id,
                        'title' => 'Document Returned for Correction',
                        'message' => 'Your submission "'.$submission->title.'" was returned by DILG Validator. Reason: '.$subData['remarks'],
                        'type' => 'warning',
                        'link' => '/submissions/'.$submission->id,
                        'is_read' => false,
                        'created_at' => now()->subHours(2),
                    ]);
                } elseif ($subData['status'] === 'verified') {
                    Notification::create([
                        'user_id' => $u->id,
                        'barangay_id' => $barangay->id,
                        'title' => 'Submission Approved & Verified',
                        'message' => 'Congratulations! Your submission "'.$submission->title.'" was verified with a score of '.$submission->score.'%.',
                        'type' => 'success',
                        'link' => '/submissions/'.$submission->id,
                        'is_read' => true,
                        'created_at' => now()->subDays(1),
                    ]);
                }
            }
        }

        // Seed some system Audit Logs
        $sampleLogs = [
            ['action' => 'AUTH_LOGIN', 'description' => 'User Jerome M. Lingan (MLGOO) logged in successfully.', 'user_id' => $admin?->id, 'entity_type' => 'User', 'entity_id' => $admin?->id],
            ['action' => 'SUBMISSION_VERIFIED', 'description' => 'Validator Apolinario Mabini approved 2026 Annual Budget for Barangay I (Poblacion 1).', 'user_id' => $primaryChecker?->id, 'entity_type' => 'Submission', 'entity_id' => 1],
            ['action' => 'ANNOUNCEMENT_BROADCAST', 'description' => 'Admin broadcasted memo: Urgent Submission of 2026 Approved Annual Budget.', 'user_id' => $admin?->id, 'entity_type' => 'Announcement', 'entity_id' => 1],
            ['action' => 'DOCUMENT_RETURNED', 'description' => 'Validator returned Solid Waste MRF Report to Barangay Biluso with correction remarks.', 'user_id' => $primaryChecker?->id, 'entity_type' => 'Submission', 'entity_id' => 5],
            ['action' => 'BARANGAY_INFO_UPDATED', 'description' => 'Barangay Secretary updated contact information and environmental status for Acacia.', 'user_id' => $barangayUsers->first()?->id, 'entity_type' => 'Barangay', 'entity_id' => 1],
        ];

        foreach ($sampleLogs as $log) {
            AuditLog::create([
                'user_id' => $log['user_id'],
                'action' => $log['action'],
                'description' => $log['description'],
                'entity_type' => $log['entity_type'],
                'entity_id' => $log['entity_id'],
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
                'created_at' => now()->subHours(rand(1, 48)),
            ]);
        }
    }
}
