<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Deadline;
use App\Models\DocumentRequirement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class SglgCategoryRequirementSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'code' => 'FIN',
                'name' => 'Financial Administration',
                'description' => 'Annual approved budget, Barangay Full Disclosure Policy (BFDP), financial transactions posting, bidding, and procurement summaries.',
                'icon' => 'Landmark',
                'weight' => 20,
                'is_core' => true,
                'requirements' => [
                    ['name' => 'Approved Annual Barangay Budget Ordinance', 'frequency' => 'annual', 'description' => 'Sangguniang Barangay approved budget enacted before Dec 31.'],
                    ['name' => 'Barangay Full Disclosure Policy (BFDP) Posting', 'frequency' => 'quarterly', 'description' => 'Quarterly photos and documentation of 3 conspicuous bulletin board postings.'],
                    ['name' => 'Quarterly Statement of Receipts & Expenditures', 'frequency' => 'quarterly', 'description' => 'Itemized summary of incoming funds, tax shares, and operational expenses.'],
                    ['name' => 'Summary of Notice of Award & Procurement (BIMS)', 'frequency' => 'quarterly', 'description' => 'Quarterly procurement transparency report and bid documentation.'],
                    ['name' => 'Barangay Financial Transactions Log', 'frequency' => 'monthly', 'description' => 'Monthly summary of disbursements, vouchers, and cash flow records.'],
                ],
                'deadline' => [
                    'title' => 'Q1 Financial Disclosure & Annual Budget Certification',
                    'description' => 'Submit Q1 BFDP bulletin board photos, Approved Budget Ordinance, and Receipts Summary.',
                    'due_date' => Carbon::now()->addDays(14)->setTime(23, 59, 59),
                    'target_period' => 'Q1 2026',
                ],
            ],
            [
                'code' => 'DIS',
                'name' => 'Disaster Preparedness',
                'description' => 'Barangay Disaster Risk Reduction & Management (BDRRM) plan, functional emergency equipment, power generators, and DRRM fund utilization.',
                'icon' => 'ShieldAlert',
                'weight' => 20,
                'is_core' => true,
                'requirements' => [
                    ['name' => 'Approved BDRRM Plan & Budget', 'frequency' => 'annual', 'description' => 'Comprehensive 3-year Disaster Risk Reduction and Management Plan.'],
                    ['name' => 'Emergency Equipment & Generator Inventory', 'frequency' => 'quarterly', 'description' => 'Photo documentation & operational status of rescue gear, communication devices, and generator sets.'],
                    ['name' => 'Evacuation Center Assessment & Management Plan', 'frequency' => 'annual', 'description' => 'Designated evacuation facilities and safety protocols.'],
                    ['name' => 'Local DRRM Fund Utilization Report', 'frequency' => 'semestral', 'description' => 'Expenditure summary of the 5% BDRRM statutory fund.'],
                    ['name' => 'Early Warning System (EWS) Operational Guide', 'frequency' => 'quarterly', 'description' => 'Siren and broadcast readiness documentation.'],
                ],
                'deadline' => [
                    'title' => 'BDRRM Equipment Inspection & EWS Readiness Report',
                    'description' => 'Submit functional equipment checklist, generator photos, and rescue readiness report.',
                    'due_date' => Carbon::now()->addDays(21)->setTime(23, 59, 59),
                    'target_period' => 'Q1 2026',
                ],
            ],
            [
                'code' => 'PNO',
                'name' => 'Peace and Order',
                'description' => 'Barangay Peace and Order Public Safety (BPOPS) plan, Katarungang Pambarangay (KP), BADAC watchlist, and Tanod training & EO.',
                'icon' => 'ShieldCheck',
                'weight' => 20,
                'is_core' => true,
                'requirements' => [
                    ['name' => 'BPOPS Plan & Fund Utilization', 'frequency' => 'annual', 'description' => 'Barangay Peace and Order and Public Safety 3-year plan and budget allocation.'],
                    ['name' => 'Katarungang Pambarangay (KP) Quarterly Report', 'frequency' => 'quarterly', 'description' => 'Summary of disputes handled, settled, and orders issued to court.'],
                    ['name' => 'BADAC Watchlist & Monthly Monitoring Report', 'frequency' => 'monthly', 'description' => 'Barangay Anti-Drug Abuse Council progressive monitoring report.'],
                    ['name' => 'Barangay Tanod Executive Order & Training Records', 'frequency' => 'annual', 'description' => 'Appointment EO and capacity-building certificates for tanods.'],
                    ['name' => 'Barangay Peace and Order Information Report', 'frequency' => 'monthly', 'description' => 'Monthly peace and security log, blotter summary, and curfew enforcement.'],
                    ['name' => 'Enforcement Reports (Topada/Videoke/Curfew/Liquor Ban)', 'frequency' => 'monthly', 'description' => 'Local peace ordinances enforcement logs.'],
                ],
                'deadline' => [
                    'title' => 'Quarterly KP & BADAC Peace and Order Submission',
                    'description' => 'Submit Q1 KP dispute settlements and monthly BADAC monitoring summary.',
                    'due_date' => Carbon::now()->addDays(7)->setTime(23, 59, 59),
                    'target_period' => 'Q1 2026',
                ],
            ],
            [
                'code' => 'SOC',
                'name' => 'Social Protection',
                'description' => 'Barangay Council for the Protection of Children (BCPC), VAWC Desk, PWD Registry, Gender and Development (GAD) Plan & Accomplishment.',
                'icon' => 'HeartHandshake',
                'weight' => 15,
                'is_core' => false,
                'requirements' => [
                    ['name' => 'GAD Plan & Budget 2026', 'frequency' => 'annual', 'description' => 'Gender and Development 5% mandatory budget allocation plan.'],
                    ['name' => 'GAD Accomplishment Report', 'frequency' => 'annual', 'description' => 'Annual gender mainstreaming programs and beneficiaries summary.'],
                    ['name' => 'VAWC Desk Quarterly Accomplishment Report', 'frequency' => 'quarterly', 'description' => 'Violence Against Women and Children desk cases and referral records.'],
                    ['name' => 'BCPC Work & Financial Plan and Quarterly Report', 'frequency' => 'quarterly', 'description' => 'Protection of Children council programs and juvenile intervention.'],
                    ['name' => 'Updated PWD & Senior Citizens Registry', 'frequency' => 'semestral', 'description' => 'Verified masterlist of registered Persons with Disabilities and Elderly.'],
                    ['name' => 'PPAN / RPRH / HAPAG Project Compliance Report', 'frequency' => 'semestral', 'description' => 'Nutrition, reproductive health, and food gardening programs.'],
                ],
                'deadline' => [
                    'title' => 'GAD Plan & VAWC Desk Q1 Accomplishment Submission',
                    'description' => 'Submit Annual GAD Plan and quarterly VAWC desk intake reports.',
                    'due_date' => Carbon::now()->addDays(28)->setTime(23, 59, 59),
                    'target_period' => 'Q1 2026',
                ],
            ],
            [
                'code' => 'BUS',
                'name' => 'Business Friendliness',
                'description' => 'Barangay business clearances, investment promotion, compliance with Ease of Doing Business (EODB), and simplified permitting.',
                'icon' => 'Store',
                'weight' => 10,
                'is_core' => false,
                'requirements' => [
                    ['name' => 'Barangay Business Clearance Masterlist', 'frequency' => 'quarterly', 'description' => 'Log of issued business permits and regulatory compliance.'],
                    ['name' => 'Citizen Charter / EODB Flowchart Posting', 'frequency' => 'annual', 'description' => 'Clear schedule of fees and process flow posted in barangay hall.'],
                    ['name' => 'Local Investment & Micro-Enterprise Promotion Support', 'frequency' => 'semestral', 'description' => 'Assistance programs for local MSMEs and livelihood initiatives.'],
                ],
                'deadline' => [
                    'title' => 'Semi-Annual Business Clearances & MSME Support Report',
                    'description' => 'Submit issued business permits log and Ease of Doing Business signage verification.',
                    'due_date' => Carbon::now()->addDays(35)->setTime(23, 59, 59),
                    'target_period' => 'Q1-Q2 2026',
                ],
            ],
            [
                'code' => 'ENV',
                'name' => 'Environmental Management',
                'description' => 'Solid Waste Management (MRF), Clean-up drive accomplishment reports, Tree planting, Safe spaces, and Environmental ordinances.',
                'icon' => 'Trees',
                'weight' => 15,
                'is_core' => false,
                'requirements' => [
                    ['name' => 'Solid Waste Management & MRF Operation Report', 'frequency' => 'quarterly', 'description' => 'Materials Recovery Facility functionality and waste segregation data.'],
                    ['name' => 'Community Clean-Up Drive Accomplishment Report', 'frequency' => 'monthly', 'description' => 'Photo documentation, volume collected, and volunteer attendance.'],
                    ['name' => 'Tree Planting Activity & Site Maintenance Documentation', 'frequency' => 'quarterly', 'description' => 'Number of seedlings planted, geo-tagged photos, and survival rate.'],
                    ['name' => 'Enacted Environmental & Anti-Littering Ordinances', 'frequency' => 'annual', 'description' => 'Barangay council resolutions and penalties enforced.'],
                    ['name' => 'Safe Spaces & Clean Public Areas Certification', 'frequency' => 'quarterly', 'description' => 'Inspection report for clean roads, unclogged canals, and green spaces.'],
                ],
                'deadline' => [
                    'title' => 'Q1 Solid Waste MRF Compliance & Clean-Up Report',
                    'description' => 'Submit monthly clean-up drive photos, tree planting logs, and MRF inspection reports.',
                    'due_date' => Carbon::now()->addDays(10)->setTime(23, 59, 59),
                    'target_period' => 'Q1 2026',
                ],
            ],
        ];

        foreach ($categories as $catData) {
            $requirements = $catData['requirements'];
            $deadlineData = $catData['deadline'];
            unset($catData['requirements'], $catData['deadline']);

            $category = Category::updateOrCreate(['code' => $catData['code']], $catData);

            foreach ($requirements as $req) {
                DocumentRequirement::updateOrCreate(
                    ['category_id' => $category->id, 'name' => $req['name']],
                    $req
                );
            }

            if ($deadlineData) {
                Deadline::updateOrCreate(
                    ['category_id' => $category->id, 'title' => $deadlineData['title']],
                    [
                        'description' => $deadlineData['description'],
                        'due_date' => $deadlineData['due_date'],
                        'target_year' => 2026,
                        'target_period' => $deadlineData['target_period'],
                    ]
                );
            }
        }
    }
}
