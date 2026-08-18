import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutGrid,
    FileUp,
    History,
    FileCheck2,
    Megaphone,
    FileCode2,
    Shield,
    Users,
    ClipboardList,
    Building2,
    LogOut,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import AlertModal from '@/components/ui/alert-modal';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

export default function AppSidebar() {
    const page = usePage();
    const user = page.props.auth?.user;
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    const currentUrl = page.url || '';

    const isAdmin = user?.role === 'admin';
    const isChecker = user?.role === 'checker';
    const isBarangay = user?.role === 'barangay' || (!isAdmin && !isChecker);

    // Build role-based navigation menu
    const navItems = [];

    if (isAdmin) {
        navItems.push(
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
            { title: 'Barangay Rankings', href: '/barangays', icon: Building2 },
            { title: 'All Submissions', href: '/submissions', icon: ClipboardList },
            { title: 'Users Management', href: '/users', icon: Users },
            { title: 'Broadcast Announcements', href: '/announcements', icon: Megaphone },
            { title: 'Document Templates', href: '/templates', icon: FileCode2 },
            { title: 'Audit Logs', href: '/logs', icon: Shield }
        );
    } else if (isChecker) {
        navItems.push(
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
            { title: 'Submissions Queue', href: '/submissions', icon: FileCheck2 },
            { title: 'Announcements', href: '/announcements', icon: Megaphone },
            { title: 'Activity Logs', href: '/logs', icon: Shield }
        );
    } else {
        // Barangay Submitter (Clean 6 items without System Logs)
        navItems.push(
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
            { title: 'Submit Compliance', href: '/submissions/create', icon: FileUp },
            { title: 'My Submissions', href: '/submissions', icon: ClipboardList },
            { title: 'History & Tracking', href: '/history', icon: History },
            { title: 'Document Templates', href: '/templates', icon: FileCode2 },
            { title: 'Announcements', href: '/announcements', icon: Megaphone }
        );
    }

    const checkIsActive = (href: string) => {
        if (href === '/dashboard') {
            return currentUrl === '/dashboard' || currentUrl === '/' || currentUrl.startsWith('/dashboard?');
        }
        return currentUrl.startsWith(href);
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <>
            <Sidebar collapsible="icon" className="bg-slate-900 border-r border-slate-800 text-slate-200">
                {/* Header with App Logo */}
                <SidebarHeader className="border-b border-slate-800/80 p-3">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="hover:bg-slate-800 focus:bg-slate-800">
                                <Link href="/dashboard" className="flex items-center gap-3">
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                {/* Content Menu Items */}
                <SidebarContent className="p-2">
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-0.5 mb-1">
                            Navigation
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-0.5">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = checkIsActive(item.href);

                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                tooltip={item.title}
                                                className={`transition-colors text-xs font-medium rounded-lg h-8 px-2.5 ${
                                                    isActive
                                                        ? 'bg-slate-800 text-white font-bold border-l-2 border-sky-400 pl-2 shadow-xs'
                                                        : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                                                }`}
                                            >
                                                <Link href={item.href} className="flex items-center gap-2.5">
                                                    <Icon className={`size-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                                                    <span className="truncate">{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                {/* Footer with Centered & Collapsible Logout Button */}
                <SidebarFooter className="border-t border-slate-800/80 p-2 bg-slate-950/60">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="Sign Out"
                                onClick={() => setLogoutModalOpen(true)}
                                className="w-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer h-9"
                            >
                                <LogOut className="size-4 shrink-0 text-slate-400 group-hover/menu-button:text-rose-400" />
                                <span className="font-semibold text-xs text-slate-300 group-hover/menu-button:text-rose-300">
                                    Sign Out
                                </span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            {/* Logout Confirm Alert Modal */}
            <AlertModal
                isOpen={logoutModalOpen}
                onClose={() => setLogoutModalOpen(false)}
                onConfirm={handleLogout}
                type="logout"
                title="Confirm Logout"
                description="Are you sure you want to end your current session?"
                confirmText="Log Out"
                cancelText="Cancel"
                showCancel={true}
            />
        </>
    );
}

export { AppSidebar };
