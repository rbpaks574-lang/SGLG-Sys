import { FormEvent, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    Files,
    Clock,
    CheckCircle2,
    RotateCcw,
    Send,
    Award,
    Plus,
    Eye,
    Calendar,
    Megaphone,
    Building2,
    Check,
    ArrowRight,
    FileText,
} from 'lucide-react';
import { BarChartTop10 } from '@/components/ui/sglg-charts';
import DocumentViewerModal from '@/components/ui/document-viewer-modal';
import AlertModal from '@/components/ui/alert-modal';

type Props = {
    metrics: {
        total: number;
        pending: number;
        verified: number;
        returned: number;
        forwarded: number;
    };
    ranking: {
        top10: Array<{ rank: number; id: number; name: string; score: number; isCurrent: boolean }>;
        yourRank: number;
        totalBarangays: number;
        overallScore: number;
    };
    recentSubmissions: Array<{
        id: number;
        title: string;
        category_name: string;
        category_code: string;
        status: string;
        score: number;
        submitted_at: string;
        files: Array<{ id: number; name: string; type: string; size: number; url: string }>;
        latest_remark?: string;
    }>;
    upcomingDeadlines: Array<{
        id: number;
        title: string;
        category_name: string;
        due_date: string;
        is_urgent: boolean;
        target_period: string;
    }>;
    announcements: Array<{
        id: number;
        title: string;
        content: string;
        is_pinned: boolean;
        attachment_name?: string;
        created_at: string;
    }>;
    barangayInfo: {
        id: number;
        name: string;
        code: string;
        captain_name: string;
        contact_number: string;
        pollution_status: string;
        population: number;
    } | null;
};

export default function UserDashboard({
    metrics,
    ranking,
    recentSubmissions,
    upcomingDeadlines,
    announcements,
    barangayInfo,
}: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string; error?: string };

    // Document Preview Modal State
    const [selectedFile, setSelectedFile] = useState<{ id?: number; name: string; type?: string; size?: number; url?: string } | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    // Read More Announcement Modal
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<(typeof announcements)[0] | null>(null);

    // Edit Barangay Info Form
    const { data, setData, put, processing } = useForm({
        captain_name: barangayInfo?.captain_name || '',
        contact_number: barangayInfo?.contact_number || '',
        pollution_status: barangayInfo?.pollution_status || 'Low / Managed',
    });

    const handleUpdateBarangay = (e: FormEvent) => {
        e.preventDefault();
        if (!barangayInfo) return;
        put(`/barangays/${barangayInfo.id}`, {
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return <span className="badge badge-success badge-sm text-white font-semibold gap-1"><CheckCircle2 className="size-3" /> Verified</span>;
            case 'returned':
                return <span className="badge badge-error badge-sm text-white font-semibold gap-1"><RotateCcw className="size-3" /> Returned</span>;
            case 'forwarded':
                return <span className="badge badge-info badge-sm font-semibold gap-1"><Send className="size-3" /> Forwarded</span>;
            case 'under_review':
                return <span className="badge badge-warning badge-sm font-semibold gap-1"><Clock className="size-3" /> Under Review</span>;
            default:
                return <span className="badge badge-neutral badge-sm font-semibold gap-1"><Clock className="size-3" /> Pending</span>;
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Barangay Submitter Dashboard - SGLG-SYS" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                {/* Flash Message Banner */}
                {flash?.success && (
                    <div className="alert alert-success shadow-sm rounded-xl text-white text-xs font-semibold py-2.5">
                        <CheckCircle2 className="size-4" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* 5 Top Metric Cards (DaisyUI simple clean stats) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {/* Card 1: Total Submissions */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Docs</span>
                            <Files className="size-4 text-slate-400" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                            {metrics.total}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Uploaded files</div>
                    </div>

                    {/* Card 2: Pending */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending</span>
                            <Clock className="size-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                            {metrics.pending}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">For review</div>
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
                        <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Compliant</div>
                    </div>

                    {/* Card 4: Returned */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Returned</span>
                            <RotateCcw className="size-4 text-rose-500" />
                        </div>
                        <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                            {metrics.returned}
                        </div>
                        <div className="text-[11px] text-rose-500 font-medium mt-0.5">Needs correction</div>
                    </div>

                    {/* Card 5: Forwarded */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm col-span-2 sm:col-span-1 dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Forwarded</span>
                            <Send className="size-4 text-sky-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                            {metrics.forwarded}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">To MLGOO</div>
                    </div>
                </div>

                {/* Main 2-Column Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT SIDE (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* SGLG Compliance Scores & Ranking */}
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Award className="size-4 text-slate-600 dark:text-slate-300" /> SGLG Compliance Ranking
                                    </h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Standings among 64 Silang Barangays
                                    </p>
                                </div>

                                {/* Rank & Score Badges */}
                                <div className="flex items-center gap-2">
                                    <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-center dark:bg-slate-800 dark:border-slate-700">
                                        <span className="text-[9px] uppercase font-bold text-slate-500 block">Your Rank</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            #{ranking.yourRank} of {ranking.totalBarangays}
                                        </span>
                                    </div>
                                    <div className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-center dark:bg-slate-800">
                                        <span className="text-[9px] uppercase font-semibold text-slate-300 block">Overall Score</span>
                                        <span className="text-xs font-bold text-white">
                                            {ranking.overallScore.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Bar Chart Top 10 */}
                            <BarChartTop10 data={ranking.top10} />
                        </div>

                        {/* Recent Submissions */}
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Files className="size-4 text-slate-600 dark:text-slate-300" /> Recent Submissions
                                    </h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Latest uploaded compliance documents
                                    </p>
                                </div>
                                <Link
                                    href="/submissions/create"
                                    className="btn btn-xs btn-neutral font-semibold gap-1 rounded-lg shadow-sm"
                                >
                                    <Plus className="size-3" /> New Submission
                                </Link>
                            </div>

                            {recentSubmissions.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="size-8 text-slate-300 mx-auto mb-1.5" />
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No submissions uploaded yet.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="table table-sm w-full">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase">
                                                <th>Title</th>
                                                <th>Category</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                                <th className="text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                            {recentSubmissions.map((sub) => (
                                                <tr key={sub.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                                    <td className="font-semibold text-slate-800 dark:text-slate-200 max-w-[180px] truncate">
                                                        {sub.title}
                                                        {sub.latest_remark && (
                                                            <div className="text-[10px] text-rose-500 truncate mt-0.5 font-normal">
                                                                Remark: {sub.latest_remark}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-ghost badge-sm text-[10px]">
                                                            {sub.category_code}
                                                        </span>
                                                    </td>
                                                    <td>{getStatusBadge(sub.status)}</td>
                                                    <td className="text-slate-500 text-[11px]">
                                                        {sub.submitted_at}
                                                    </td>
                                                    <td className="text-right">
                                                        {sub.files.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedFile(sub.files[0]);
                                                                    setIsViewerOpen(true);
                                                                }}
                                                                className="btn btn-ghost btn-xs text-slate-600 hover:text-slate-900 gap-1 dark:text-slate-300"
                                                            >
                                                                <Eye className="size-3" /> View
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-right">
                                <Link
                                    href="/history"
                                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 dark:text-slate-400 dark:hover:text-slate-200"
                                >
                                    View Full History <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Barangay Information Card (with Captain & Pollution Editable) */}
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Building2 className="size-4 text-slate-600 dark:text-slate-300" /> Barangay Profile
                                </h3>
                                <span className="badge badge-neutral badge-xs font-semibold">
                                    {barangayInfo?.code || 'BRGY'}
                                </span>
                            </div>

                            <form onSubmit={handleUpdateBarangay} className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                        Barangay Name
                                    </label>
                                    <div className="input input-sm input-bordered w-full font-semibold bg-slate-50 text-slate-700 cursor-not-allowed dark:bg-slate-800 dark:text-slate-200 flex items-center">
                                        {barangayInfo?.name}
                                    </div>
                                </div>

                                {/* Captain Name (Editable) */}
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                                        <span>Punong Barangay / Captain</span>
                                        <span className="text-[9px] text-slate-400 lowercase">(editable)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.captain_name}
                                        onChange={(e) => setData('captain_name', e.target.value)}
                                        placeholder="Captain Name"
                                        className="input input-sm input-bordered w-full text-xs font-medium"
                                    />
                                </div>

                                {/* Contact Number */}
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                        Contact Number
                                    </label>
                                    <input
                                        type="text"
                                        value={data.contact_number}
                                        onChange={(e) => setData('contact_number', e.target.value)}
                                        placeholder="0917-xxx-xxxx"
                                        className="input input-sm input-bordered w-full text-xs font-medium"
                                    />
                                </div>

                                {/* Pollution / Environmental Status (Editable with update button on right side as required!) */}
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                                        <span>Pollution / Environmental Status</span>
                                        <span className="text-[9px] text-slate-400 lowercase">(editable)</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={data.pollution_status}
                                            onChange={(e) => setData('pollution_status', e.target.value)}
                                            placeholder="e.g. Low / Managed"
                                            className="input input-sm input-bordered flex-1 text-xs font-medium"
                                        />
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="btn btn-sm btn-neutral text-xs font-semibold rounded-lg shrink-0 gap-1"
                                        >
                                            {processing ? <span className="loading loading-spinner loading-xs" /> : <Check className="size-3" />}
                                            Update
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Upcoming Deadlines */}
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 dark:border-slate-800">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Calendar className="size-4 text-slate-600 dark:text-slate-300" /> Upcoming Deadlines
                                </h3>
                                <Link
                                    href="/submissions/create"
                                    className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400"
                                >
                                    View All
                                </Link>
                            </div>

                            <div className="space-y-2.5">
                                {upcomingDeadlines.length === 0 ? (
                                    <p className="text-xs text-slate-400 py-3 text-center">No active deadlines.</p>
                                ) : (
                                    upcomingDeadlines.map((d) => (
                                        <div
                                            key={d.id}
                                            className="p-3 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                        {d.title}
                                                    </h4>
                                                    <span className="text-[10px] text-slate-500">
                                                        {d.category_name} • {d.target_period}
                                                    </span>
                                                </div>
                                                {d.is_urgent && (
                                                    <span className="badge badge-error badge-xs font-bold text-white shrink-0">
                                                        URGENT
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                <Clock className="size-3" /> Due: {d.due_date}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Announcements Card */}
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 dark:border-slate-800">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Megaphone className="size-4 text-slate-600 dark:text-slate-300" /> DILG Announcements
                                </h3>
                                <Link
                                    href="/announcements"
                                    className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400"
                                >
                                    View All
                                </Link>
                            </div>

                            <div className="space-y-2.5">
                                {announcements.map((a) => (
                                    <div
                                        key={a.id}
                                        className="p-3 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-700"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[190px]">
                                                {a.title}
                                            </h4>
                                            <span className="text-[10px] text-slate-400">{a.created_at}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 line-clamp-2 dark:text-slate-400">
                                            {a.content}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAnnouncement(a)}
                                            className="text-[11px] text-slate-700 hover:underline font-semibold mt-1 inline-block dark:text-slate-300"
                                        >
                                            Read More →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Viewer Modal */}
            <DocumentViewerModal
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                file={selectedFile}
            />

            {/* Read More Announcement Modal */}
            {selectedAnnouncement && (
                <AlertModal
                    isOpen={Boolean(selectedAnnouncement)}
                    onClose={() => setSelectedAnnouncement(null)}
                    title={selectedAnnouncement.title}
                    description={selectedAnnouncement.content}
                    type="info"
                    confirmText="Close"
                />
            )}
        </AppSidebarLayout>
    );
}
