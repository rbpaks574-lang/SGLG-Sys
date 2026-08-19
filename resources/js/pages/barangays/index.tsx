import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    Building2,
    Search,
    BarChart3,
    PieChart,
    Eye,
    X,
    UserCheck,
    Phone,
    Wind,
    Users,
} from 'lucide-react';
import { BarChartTop10, DonutChart } from '@/components/ui/sglg-charts';

type BarangayItem = {
    id: number;
    name: string;
    code: string;
    captain_name?: string;
    secretary_name?: string;
    contact_number?: string;
    pollution_status: string;
    population: number;
    compliance_score: number;
    total_submissions_count: number;
    verified_count: number;
    pending_count: number;
    returned_count: number;
};

type Props = {
    barangays: {
        data: BarangayItem[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    top10: Array<{ rank: number; name: string; score: number }>;
    onTimeVsLate: Array<{ label: string; value: number; color: string }>;
    filters: { search: string };
};

export default function BarangaysIndex({
    barangays,
    top10,
    onTimeVsLate,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedBarangay, setSelectedBarangay] = useState<BarangayItem | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/barangays', { search }, { preserveState: true });
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Barangay Rankings', href: '/barangays' }]}>
            <Head title="64 Barangays Ranking - SGLG-SYS" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Building2 className="size-5 text-slate-600 dark:text-slate-300" /> Silang, Cavite Barangay Rankings
                    </h1>
                    <p className="text-xs text-slate-500">
                        Official compliance standing of all 64 component barangays under SGLGB standards
                    </p>
                </div>

                {/* Top Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Left: Top 10 Performance Ranking Bar Chart (7 cols) */}
                    <div className="lg:col-span-7 rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <BarChart3 className="size-4 text-slate-600 dark:text-slate-300" /> Top 10 Performance Ranking
                            </h3>
                            <span className="badge badge-neutral badge-xs font-semibold">TOP 10</span>
                        </div>
                        <BarChartTop10 data={top10} />
                    </div>

                    {/* Right: Submissions Timeliness (5 cols) */}
                    <div className="lg:col-span-5 rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
                        <div className="border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <PieChart className="size-4 text-slate-600 dark:text-slate-300" /> Submissions Timeliness
                            </h3>
                            <p className="text-[11px] text-slate-400">On-Time vs Late Submissions</p>
                        </div>

                        <div className="my-auto py-2">
                            <DonutChart
                                data={onTimeVsLate}
                                size={150}
                                centerLabel="Submissions"
                            />
                        </div>
                    </div>
                </div>

                {/* Search & Complete Table */}
                <div className="rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
                    {/* Search Toolbar */}
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            Complete Ranking ({barangays.total} Barangays)
                        </h3>

                        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-72">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search barangay or captain..."
                                    className="input input-sm input-bordered w-full pl-8 text-xs font-medium"
                                />
                            </div>
                            <button type="submit" className="btn btn-sm btn-neutral text-xs px-3">
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="table table-sm w-full">
                            <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 text-slate-500 text-[10px] uppercase tracking-wider">
                                <tr>
                                    <th className="w-14">Rank</th>
                                    <th>Barangay Name</th>
                                    <th>Punong Barangay</th>
                                    <th>Compliance Score</th>
                                    <th>Total Docs</th>
                                    <th>Verified</th>
                                    <th>Pending</th>
                                    <th>Environmental Status</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                {barangays.data.map((b, idx) => {
                                    const rankNum = (barangays.current_page - 1) * 15 + idx + 1;
                                    return (
                                        <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                            <td>
                                                <div className={`flex size-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                                                    rankNum === 1 ? 'bg-slate-900 text-white dark:bg-slate-700' :
                                                    rankNum <= 3 ? 'bg-slate-700 text-white' :
                                                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                                }`}>
                                                    #{rankNum}
                                                </div>
                                            </td>
                                            <td className="font-semibold text-slate-900 dark:text-slate-100">
                                                {b.name}
                                                <div className="text-[10px] text-slate-400 font-normal">{b.code}</div>
                                            </td>
                                            <td className="text-slate-600 dark:text-slate-300">
                                                <div className="font-semibold text-slate-800 dark:text-slate-200">{b.captain_name || 'N/A'}</div>
                                                <div className="text-[10px] text-slate-400 font-normal">Sec: {b.secretary_name || 'Not set'}</div>
                                            </td>
                                            <td>
                                                <span className="font-bold text-xs font-mono text-slate-800 dark:text-slate-200">
                                                    {b.compliance_score.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="text-slate-700 dark:text-slate-300 font-medium">
                                                {b.total_submissions_count}
                                            </td>
                                            <td>
                                                <span className="badge badge-success badge-xs font-semibold text-white">
                                                    {b.verified_count}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge badge-warning badge-xs font-semibold">
                                                    {b.pending_count}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge badge-ghost badge-sm text-[10px]">
                                                    {b.pollution_status || 'Managed'}
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedBarangay(b)}
                                                    className="btn btn-xs btn-outline text-xs gap-1"
                                                >
                                                    <Eye className="size-3" /> View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 border-t border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/60 text-xs text-slate-500">
                        <div>
                            Showing <strong>{barangays.from || 0}</strong> to <strong>{barangays.to || 0}</strong> of <strong>{barangays.total}</strong> barangays
                        </div>

                        <div className="join">
                            {barangays.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    preserveScroll
                                    preserveState
                                    className={`join-item btn btn-xs ${
                                        link.active
                                            ? 'btn-neutral font-semibold'
                                            : link.url
                                            ? 'btn-ghost'
                                            : 'btn-disabled opacity-40'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Barangay Details Drilldown Modal */}
            {selectedBarangay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 animate-in fade-in duration-150">
                    <div className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
                            <div>
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <Building2 className="size-4 text-sky-400" />
                                    Barangay {selectedBarangay.name} ({selectedBarangay.code})
                                </h3>
                                <p className="text-[11px] text-slate-300">
                                    Silang, Cavite • SGLGB Summary
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedBarangay(null)}
                                className="btn btn-ghost btn-circle btn-xs text-white"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 text-xs">
                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-2 text-center">
                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                    <span className="text-[9px] text-slate-400 uppercase font-semibold block">Score</span>
                                    <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                                        {selectedBarangay.compliance_score.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                    <span className="text-[9px] text-slate-400 uppercase font-semibold block">Total</span>
                                    <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                                        {selectedBarangay.total_submissions_count}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                    <span className="text-[9px] text-slate-400 uppercase font-semibold block">Verified</span>
                                    <span className="text-base font-bold text-emerald-600 font-mono">
                                        {selectedBarangay.verified_count}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                    <span className="text-[9px] text-slate-400 uppercase font-semibold block">Pending</span>
                                    <span className="text-base font-bold text-amber-600 font-mono">
                                        {selectedBarangay.pending_count}
                                    </span>
                                </div>
                            </div>

                            {/* Info Table */}
                            <div className="space-y-2 p-3.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-500 flex items-center gap-1"><UserCheck className="size-3" /> Punong Barangay:</span>
                                    <strong className="text-slate-800 dark:text-slate-100">{selectedBarangay.captain_name || 'Not specified'}</strong>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-500 flex items-center gap-1"><UserCheck className="size-3" /> Barangay Secretary:</span>
                                    <strong className="text-slate-800 dark:text-slate-100">{selectedBarangay.secretary_name || 'Not specified'}</strong>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-500 flex items-center gap-1"><Phone className="size-3" /> Contact:</span>
                                    <strong className="text-slate-800 dark:text-slate-100">{selectedBarangay.contact_number || 'N/A'}</strong>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-500 flex items-center gap-1"><Wind className="size-3" /> Environmental Status:</span>
                                    <strong className="text-slate-800 dark:text-slate-100">{selectedBarangay.pollution_status}</strong>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-500 flex items-center gap-1"><Users className="size-3" /> Population:</span>
                                    <strong className="text-slate-800 dark:text-slate-100">{selectedBarangay.population.toLocaleString()} Residents</strong>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end dark:border-slate-800 dark:bg-slate-800/40">
                            <button
                                type="button"
                                onClick={() => setSelectedBarangay(null)}
                                className="btn btn-xs btn-ghost"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppSidebarLayout>
    );
}
