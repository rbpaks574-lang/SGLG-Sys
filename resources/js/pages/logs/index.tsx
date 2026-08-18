import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    Shield,
    Search,
    RotateCcw,
} from 'lucide-react';

type AuditLogItem = {
    id: number;
    action: string;
    description: string;
    entity_type?: string;
    entity_id?: number;
    ip_address?: string;
    created_at: string;
    user?: { name: string; role: string };
};

type Props = {
    logs: {
        data: AuditLogItem[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        search: string;
        date: string;
    };
    isAdmin: boolean;
};

export default function LogsIndex({ logs, filters, isAdmin }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/logs', { search, date }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setDate('');
        router.get('/logs');
    };

    const getActionBadge = (action: string) => {
        switch (true) {
            case action.includes('CREATED') || action.includes('UPLOADED'):
                return <span className="badge badge-success badge-xs font-mono text-[9px] font-semibold">{action}</span>;
            case action.includes('VERIFIED') || action.includes('EVALUATED'):
                return <span className="badge badge-info badge-xs font-mono text-[9px] font-semibold">{action}</span>;
            case action.includes('DELETED') || action.includes('RETURNED'):
                return <span className="badge badge-error badge-xs font-mono text-[9px] font-semibold text-white">{action}</span>;
            default:
                return <span className="badge badge-ghost badge-xs font-mono text-[9px] font-semibold">{action}</span>;
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Audit Logs', href: '/logs' }]}>
            <Head title="Audit Logs - SGLG-SYS" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Shield className="size-5 text-slate-600 dark:text-slate-300" /> System Activity & Audit Logs
                    </h1>
                    <p className="text-xs text-slate-500">
                        Track system events for security and compliance monitoring
                    </p>
                </div>

                {/* Search & Date Filter Toolbar */}
                <form onSubmit={handleSearch} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto flex-1">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search user, action, or keyword..."
                                className="input input-sm input-bordered w-full pl-8 text-xs font-medium"
                            />
                        </div>

                        <div className="w-40">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="input input-sm input-bordered w-full text-xs font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="btn btn-xs btn-ghost text-slate-500 text-xs gap-1"
                        >
                            <RotateCcw className="size-3" /> Reset
                        </button>
                        <button
                            type="submit"
                            className="btn btn-sm btn-neutral text-xs font-semibold px-4 rounded-lg"
                        >
                            Search Logs
                        </button>
                    </div>
                </form>

                {/* Table with ENTITY Only (IP address removed as requested) */}
                <div className="rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table table-sm w-full">
                            <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 text-slate-500 text-[10px] uppercase tracking-wider">
                                <tr>
                                    <th className="w-36">Time</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Activity Description</th>
                                    <th>Entity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-slate-400">
                                            No audit logs found for the selected filters.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                            <td className="text-slate-500 font-mono text-[11px]">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td>
                                                <div className="font-semibold text-slate-900 dark:text-slate-100">
                                                    {log.user?.name || 'System'}
                                                </div>
                                                <span className="text-[10px] text-slate-400 uppercase">
                                                    {log.user?.role || 'SYSTEM'}
                                                </span>
                                            </td>
                                            <td>{getActionBadge(log.action)}</td>
                                            <td className="text-slate-700 dark:text-slate-300 max-w-md">
                                                {log.description}
                                            </td>
                                            <td>
                                                <span className="badge badge-ghost badge-sm font-mono text-[11px] text-slate-700 dark:text-slate-300">
                                                    {log.entity_type ? `${log.entity_type} #${log.entity_id}` : 'General'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 border-t border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/60 text-xs text-slate-500">
                        <div>
                            Showing <strong>{logs.from || 0}</strong> to <strong>{logs.to || 0}</strong> of <strong>{logs.total}</strong> entries
                        </div>

                        <div className="join">
                            {logs.links.map((link, idx) => (
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
        </AppSidebarLayout>
    );
}
