<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Category;
use App\Models\DocumentTemplate;
use App\Models\User;
use Illuminate\Database\Seeder;

class AnnouncementTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        if (! $admin) {
            return;
        }

        $finCat = Category::where('code', 'FIN')->first();
        $disCat = Category::where('code', 'DIS')->first();
        $pnoCat = Category::where('code', 'PNO')->first();
        $socCat = Category::where('code', 'SOC')->first();
        $envCat = Category::where('code', 'ENV')->first();

        // 1. Announcements
        $announcements = [
            [
                'title' => 'Urgent: Submission of 2026 Approved Annual Barangay Budget & BFDP Memos',
                'content' => 'All Punong Barangays and Barangay Secretaries are hereby advised that the deadline for uploading the Approved 2026 Annual Budget Ordinance and Q1 Barangay Full Disclosure Policy (BFDP) bulletin board photo proofs is March 31, 2026. Failure to comply before the deadline will incur a score deduction under SGLG Financial Administration Core Area.',
                'target_role' => 'all',
                'is_pinned' => true,
                'attachment_name' => 'DILG_Memo_Circular_2026_01_Budget_BFDP.pdf',
            ],
            [
                'title' => 'New Guidelines on BDRRM Early Warning System (EWS) & Generator Verification',
                'content' => 'Please be informed that DILG validators will require clear photos showing the serial number and operational status of barangay power generators and rescue communication radios during the Q1 Disaster Preparedness review.',
                'target_role' => 'barangay',
                'is_pinned' => true,
                'attachment_name' => 'BDRRM_Equipment_Inspection_Checklist_2026.pdf',
            ],
            [
                'title' => 'Monthly Katarungang Pambarangay (KP) & BADAC Progress Submission Schedule',
                'content' => 'Monthly Peace & Order reports including BADAC watchlist updates and KP court referral logs must be uploaded through the portal on or before the 10th day of the succeeding month.',
                'target_role' => 'barangay',
                'is_pinned' => false,
                'attachment_name' => 'KP_Form_Master_Guidelines.pdf',
            ],
            [
                'title' => 'Validator Standard Operating Procedure: 48-Hour Turnaround for Return Remarks',
                'content' => 'To all DILG Checkers: Ensure all returned submissions contain specific, actionable remarks (e.g. missing signature, unclear scan) and are reviewed within 48 hours of queue receipt.',
                'target_role' => 'checker',
                'is_pinned' => false,
                'attachment_name' => 'Checker_Review_Standard_Manual.pdf',
            ],
        ];

        foreach ($announcements as $ann) {
            Announcement::updateOrCreate(
                ['title' => $ann['title']],
                [
                    'user_id' => $admin->id,
                    'content' => $ann['content'],
                    'target_role' => $ann['target_role'],
                    'is_pinned' => $ann['is_pinned'],
                    'attachment_name' => $ann['attachment_name'],
                    'attachment_path' => 'templates/'.$ann['attachment_name'],
                ]
            );
        }

        // 2. Document Templates
        $templates = [
            [
                'name' => 'Official Annual Barangay Budget Ordinance Template',
                'category_id' => $finCat?->id,
                'description' => 'Standard template formatted for Sangguniang Barangay appropriation ordinances with itemized expenditure accounts.',
                'file_name' => 'Template_Annual_Barangay_Budget_Ordinance.docx',
                'file_size' => 148500,
            ],
            [
                'name' => 'Barangay Full Disclosure Policy (BFDP) 3-Board Photo Log Sheet',
                'category_id' => $finCat?->id,
                'description' => 'Photo documentation layout template for 3 conspicuous public bulletin board postings.',
                'file_name' => 'Template_BFDP_Posting_Photo_Log.docx',
                'file_size' => 210400,
            ],
            [
                'name' => 'BDRRM Emergency Equipment & Generator Status Checklist',
                'category_id' => $disCat?->id,
                'description' => 'Standard inventory form for life-saving gear, generator wattage, and rescue vehicle readiness.',
                'file_name' => 'Template_BDRRM_Equipment_Generator_Checklist.docx',
                'file_size' => 175200,
            ],
            [
                'name' => 'Katarungang Pambarangay (KP) Quarterly Settlement Report Form',
                'category_id' => $pnoCat?->id,
                'description' => 'Official DILG KP mediation, conciliation, arbitration, and certificate to file action log sheet.',
                'file_name' => 'Template_KP_Quarterly_Report_Form.docx',
                'file_size' => 192800,
            ],
            [
                'name' => 'GAD Plan & Budget (5% Statutory Allocation) Format',
                'category_id' => $socCat?->id,
                'description' => 'Standard Excel/Word matrix for Gender and Development activities, targets, and expected outputs.',
                'file_name' => 'Template_GAD_Plan_Budget_Format.docx',
                'file_size' => 245000,
            ],
            [
                'name' => 'Barangay Clean-Up Drive & Waste Segregation Accomplishment Report',
                'category_id' => $envCat?->id,
                'description' => 'Accomplishment format with before/after photos, volume of collected residual waste, and volunteer list.',
                'file_name' => 'Template_CleanUp_Drive_Accomplishment.docx',
                'file_size' => 163000,
            ],
        ];

        foreach ($templates as $t) {
            DocumentTemplate::updateOrCreate(
                ['name' => $t['name']],
                [
                    'user_id' => $admin->id,
                    'category_id' => $t['category_id'],
                    'description' => $t['description'],
                    'file_name' => $t['file_name'],
                    'file_path' => 'templates/'.$t['file_name'],
                    'file_size' => $t['file_size'],
                ]
            );
        }
    }
}
