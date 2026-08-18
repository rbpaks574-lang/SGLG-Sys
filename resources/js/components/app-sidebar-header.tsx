import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import NotificationBell from '@/components/ui/notification-bell';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/react';

export default function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage();
    const user = page.props.auth?.user;

    return (
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 sticky top-0 z-30 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
                <SidebarTrigger className="-ml-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200" />
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-3">
                <NotificationBell />

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                    <div className="avatar placeholder">
                        <div className="bg-slate-800 text-slate-200 rounded-full w-7 text-[11px] font-semibold flex items-center justify-center">
                            {user?.name?.slice(0, 2).toUpperCase() || 'U'}
                        </div>
                    </div>
                    <div className="hidden md:flex flex-col text-left">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {user?.name}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                            {user?.role === 'barangay' ? (user?.barangay?.name || 'Barangay User') : user?.role}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export { AppSidebarHeader };
