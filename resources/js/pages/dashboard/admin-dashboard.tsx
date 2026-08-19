import { FormEvent, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    Building2,
    Files,
    CheckCircle2,
    Clock,
    RotateCcw,
    BarChart3,
    PieChart,
    Megaphone,
    Activity,
    Calendar,
    Plus,
    ArrowRight,
    X,
    Shield,
    Award,
    AlertTriangle,
    Zap,
} from 'lucide-react';
import {
    BarChartTop10,
    DonutChart,
    PillarComplianceBars,
    PillarData,
    SglgEligibilityCard,
    SglgEligibilityType,
} from '@/components/ui/sglg-charts';

type Props = {
    metrics: {
        totalBarangays: number;
        totalSubmissions: number;
        verified: number;
        pending: number;
        returned: number;
        avgValidationHours?: number;
    };
    analytics: {
        top10: Array<{ rank: number; name: string; score: number }>;
        overallComplianceRate: number;
        complianceBreakdown: Array<{ label: string; value: number; color: string }>;
        statusDistribution: Array<{ label: string; value: number; color: string }>;
        pillarPerformance?: PillarData[];
        sglgEligibility?: SglgEligibilityType;
        deficiencyStats?: Array<{ label: string; value: number; color: string }>;
    };
    activityLogs: Array<{
        id: number;
        action: string;
        description: string;
        user_name?: string;
        user_role?: string;
        created_at: string;
    }>;
    announcements: Array<{
        id: number;
        title: string;
        content: string;
        target_role: string;
        is_pinned: boolean;
        created_at: string;
    }>;
};

export default function AdminDashboard({
    metrics,
    analytics,
    activityLogs,
    announcements,
}: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string; error?: string };

    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<(typeof announcements)[0] | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        title: '',
        content: '',
        target_role: 'all',
        is_pinned: false,
    });

    const handleCreateAnnouncement = (e: FormEvent) => {
        e.preventDefault();
        post('/announcements', {
            onSuccess: () => {
                setIsAnnouncementModalOpen(false);
                reset();
            },
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Evaluator Dashboard', href: '/dashboard' }]}>
            <Head title="DILG Admin Evaluator Dashboard - SGLG-SYS" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                {/* Flash Message Banner */}
                {flash?.success && (
                    <div className="alert alert-success shadow-sm rounded-xl text-white text-xs font-semibold py-2.5">
                        <CheckCircle2 className="size-4" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* 5 Cards on Top */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {/* Card 1: Total Barangays */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Barangays</span>
                            <Building2 className="size-4 text-slate-400" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                            {metrics.totalBarangays}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Component LGUs</div>
                    </div>

                    {/* Card 2: Total Submissions */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Submissions</span>
                            <Files className="size-4 text-slate-400" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                            {metrics.totalSubmissions}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Uploaded reports</div>
                    </div>

                    {/* Card 3: Verified */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Verified</span>
                            <CheckCircle2 className="size-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            {metrics.verified}
                        </div>
                        <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Approved compliance</div>
                    </div>

                    {/* Card 4: Pending */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending</span>
                            <Clock className="size-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                            {metrics.pending}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Awaiting check</div>
                    </div>

                    {/* Card 5: Returned */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm col-span-2 sm:col-span-1 dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Returned</span>
                            <RotateCcw className="size-4 text-rose-500" />
                        </div>
                        <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                            {metrics.returned}
                        </div>
                        <div className="text-[11px] text-rose-500 font-medium mt-0.5">With remarks</div>
                    </div>
                </div>

                {/* 2-Column Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Top 10 + SGLGB 3+1 Rule + Pillar Performance (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Combined Top 10 Bar Chart & Overall Compliance Donut Chart */}
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <BarChart3 className="size-4 text-slate-600 dark:text-slate-300" /> Municipal Compliance & Top 10 Rankings
                                    </h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Overall municipal performance across 64 barangays
                                    </p>
                                </div>
                                <Link
                                    href="/barangays"
                                    className="btn btn-xs btn-neutral font-semibold rounded-lg"
                                >
                                    View All 64
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                                {/* Top 10 Bar Chart */}
                                <div className="md:col-span-7">
                                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                        Top 10 LGUs
                                    </div>
                                    <BarChartTop10 data={analytics.top10} />
                                </div>

                                {/* Overall Compliance Rate Donut Chart */}
                                <div className="md:col-span-5 flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700">
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                        Compliance Rate
                                    </span>
                                    <DonutChart
                                        data={analytics.complianceBreakdown}
                                        size={130}
                                        centerLabel="Score"
                                    />
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
                                        {analytics.overallComplianceRate.toFixed(1)}% Municipal Avg
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* DILG SGLGB "3+1 Principle" Award Eligibility Predictor */}
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Award className="size-4 text-emerald-600 dark:text-emerald-400" /> SGLGB Award Eligibility Status (3+1 Principle)
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Official DILG standard: Pass 3 Core Areas + at least 1 Essential Area
                                    </p>
                                </div>
                                <span className="badge badge-success text-white font-mono text-[11px] font-bold">
                                    {analytics.sglgEligibility?.passRate ?? 0}% Pass Rate
                                </span>
                            </div>

                            <SglgEligibilityCard data={analytics.sglgEligibility} />
                        </div>

                        {/* 6 Governance Pillars Compliance Breakdown */}
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Shield className="size-4 text-slate-600 dark:text-slate-300" /> SGLGB Governance Pillars Performance
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Compliance rates across the 6 Core and Essential areas
                                    </p>
                                </div>
                            </div>

                            <PillarComplianceBars pillars={analytics.pillarPerformance} />
                        </div>

                        {/* Activity Logs with View All button */}
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Activity className="size-4 text-slate-600 dark:text-slate-300" /> Recent System Activity Logs
                                    </h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Audit records and security monitoring
                                    </p>
                                </div>
                                <Link
                                    href="/logs"
                                    className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                >
                                    View All Logs →
                                </Link>
                            </div>

                            <div className="space-y-2.5">
                                {activityLogs.slice(0, 5).map((log) => (
                                    <div
                                        key={log.id}
                                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs dark:bg-slate-800/40 dark:border-slate-700 flex items-center justify-between gap-3"
                                    >
                                        <div className="truncate">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                {log.user_name || 'System'}:
                                            </span>{' '}
                                            <span className="text-slate-600 dark:text-slate-400">
                                                {log.description}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Broadcast Announcements, Submission Status & Deficiency Analytics (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Broadcast Announcements */}
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Megaphone className="size-4 text-slate-600 dark:text-slate-300" /> Broadcast Announcements
                                    </h3>
                                    <p className="text-[11px] text-slate-500">Official circulars</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAnnouncementModalOpen(true)}
                                    className="btn btn-xs btn-neutral font-semibold gap-1 rounded-lg"
                                >
                                    <Plus className="size-3" /> New
                                </button>
                            </div>

                            <div className="space-y-2.5">
                                {announcements.map((a) => (
                                    <div
                                        key={a.id}
                                        className="p-3 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-700"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[170px]">
                                                {a.title}
                                            </h4>
                                            <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                                                <Calendar className="size-2.5" /> {a.created_at}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 line-clamp-2 dark:text-slate-400">
                                            {a.content}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-right">
                                <Link
                                    href="/announcements"
                                    className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400"
                                >
                                    View All Announcements →
                                </Link>
                            </div>
                        </div>

                        {/* Return Deficiency Root Cause Analytics */}
                        {(analytics.deficiencyStats || []).length > 0 && (
                            <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                                <div className="border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <AlertTriangle className="size-4 text-rose-500" /> Common Return Deficiency Causes
                                    </h3>
                                    <p className="text-[11px] text-slate-500">Root-cause breakdown of returned submissions</p>
                                </div>

                                <div className="py-2">
                                    <DonutChart
                                        data={analytics.deficiencyStats}
                                        size={140}
                                        centerLabel="Deficiencies"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submission Status Pie Chart */}
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <div className="border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <PieChart className="size-4 text-slate-600 dark:text-slate-300" /> Submissions Status Distribution
                                </h3>
                                <p className="text-[11px] text-slate-500">Overall report status breakdown</p>
                            </div>

                            <div className="py-2">
                                <DonutChart
                                    data={analytics.statusDistribution}
                                    size={140}
                                    centerLabel="Reports"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Announcement Modal */}
            {isAnnouncementModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Megaphone className="size-4 text-sky-400" /> New Broadcast Announcement
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsAnnouncementModalOpen(false)}
                                className="btn btn-ghost btn-circle btn-xs text-white"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAnnouncement} className="p-5 space-y-3 text-xs">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                    placeholder="Announcement Title"
                                    className="input input-sm input-bordered w-full text-xs font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Audience *
                                </label>
                                <select
                                    value={data.target_role}
                                    onChange={(e) => setData('target_role', e.target.value)}
                                    className="select select-sm select-bordered w-full text-xs font-medium"
                                >
                                    <option value="all">All Portal Users</option>
                                    <option value="barangay">Barangay Submitters Only</option>
                                    <option value="checker">Checkers Only</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Message Content *
                                </label>
                                <textarea
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    required
                                    rows={4}
                                    placeholder="Write memo details..."
                                    className="textarea textarea-bordered w-full text-xs font-medium"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsAnnouncementModalOpen(false)}
                                    className="btn btn-xs btn-ghost"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn btn-sm btn-neutral text-xs font-semibold rounded-lg"
                                >
                                    Publish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppSidebarLayout>
    );
}
