import { FormEvent, useEffect, useState, useRef } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    Users,
    Search,
    Plus,
    Edit,
    Trash2,
    CheckCircle2,
    Building2,
    X,
    UserCheck,
    ChevronDown,
    Check,
    Loader2,
} from 'lucide-react';
import AlertModal from '@/components/ui/alert-modal';

type UserItem = {
    id: number;
    name: string;
    username?: string;
    email: string;
    phone?: string;
    role: string;
    barangay_id?: number;
    is_active: boolean;
    last_login_at?: string;
    created_at: string;
    barangay?: { id: number; name: string };
};

type Props = {
    users: {
        data: UserItem[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    barangays: Array<{ id: number; name: string; code: string }>;
    filters: { search: string; role: string };
};

export default function UsersIndex({ users, barangays, filters }: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string; error?: string };

    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || 'all');
    const [isSearching, setIsSearching] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

    // Searchable Barangay dropdown state in modal
    const [barangaySearch, setBarangaySearch] = useState('');
    const [isBarangayDropdownOpen, setIsBarangayDropdownOpen] = useState(false);

    const isInitialMount = useRef(true);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        first_name: '',
        middle_initial: '',
        last_name: '',
        username: '',
        email: '',
        phone: '',
        role: 'barangay',
        barangay_id: '' as string | number,
        password: '',
        password_confirmation: '',
        is_active: true,
    });

    const parseName = (fullName: string) => {
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) {
            return { first_name: parts[0], middle_initial: '', last_name: '' };
        }
        if (parts.length === 2) {
            return { first_name: parts[0], middle_initial: '', last_name: parts[1] };
        }
        if (parts.length >= 3) {
            const potentialMI = parts[parts.length - 2];
            if (potentialMI.length <= 3) {
                return {
                    first_name: parts.slice(0, parts.length - 2).join(' '),
                    middle_initial: potentialMI.replace('.', ''),
                    last_name: parts[parts.length - 1],
                };
            }
            return {
                first_name: parts.slice(0, parts.length - 1).join(' '),
                middle_initial: '',
                last_name: parts[parts.length - 1],
            };
        }
        return { first_name: '', middle_initial: '', last_name: '' };
    };

    const prevFilters = useRef({
        search: filters.search || '',
        role: filters.role || 'all',
    });

    // Real-time debounced live search ONLY when filter inputs actually change
    useEffect(() => {
        const hasChanged =
            prevFilters.current.search !== search ||
            prevFilters.current.role !== role;

        if (!hasChanged) {
            return;
        }

        prevFilters.current = { search, role };

        setIsSearching(true);
        const timer = setTimeout(() => {
            router.get(
                '/users',
                { search, role },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onFinish: () => setIsSearching(false),
                }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search, role]);

    const openAddModal = () => {
        setEditingUser(null);
        reset();
        setData({
            name: '',
            first_name: '',
            middle_initial: '',
            last_name: '',
            username: '',
            email: '',
            phone: '',
            role: 'barangay',
            barangay_id: barangays[0]?.id || '',
            password: '',
            password_confirmation: '',
            is_active: true,
        });
        setBarangaySearch('');
        setIsBarangayDropdownOpen(false);
        setIsModalOpen(true);
    };

    const openEditModal = (u: UserItem) => {
        setEditingUser(u);
        const parsed = parseName(u.name);
        setData({
            name: u.name,
            first_name: parsed.first_name,
            middle_initial: parsed.middle_initial,
            last_name: parsed.last_name,
            username: u.username || '',
            email: u.email,
            phone: u.phone || '',
            role: u.role,
            barangay_id: u.barangay_id || '',
            password: '',
            password_confirmation: '',
            is_active: u.is_active,
        });
        setBarangaySearch('');
        setIsBarangayDropdownOpen(false);
        setIsModalOpen(true);
    };

    const handleSaveUser = (e: FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            put(`/users/${editingUser.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/users', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDeleteUser = () => {
        if (!deletingUser) return;
        destroy(`/users/${deletingUser.id}`, {
            onSuccess: () => setDeletingUser(null),
        });
    };

    const getRoleBadge = (roleName: string) => {
        switch (roleName) {
            case 'admin':
                return <span className="badge badge-neutral badge-xs font-semibold text-[10px]">ADMIN</span>;
            case 'checker':
                return <span className="badge badge-ghost badge-xs font-semibold text-[10px]">CHECKER</span>;
            default:
                return <span className="badge badge-outline badge-xs font-semibold text-[10px]">BARANGAY</span>;
        }
    };

    const filteredBarangays = barangays.filter((b) =>
        b.name.toLowerCase().includes(barangaySearch.toLowerCase()) ||
        b.code.toLowerCase().includes(barangaySearch.toLowerCase())
    );

    const selectedBarangay = barangays.find((b) => b.id === Number(data.barangay_id));

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Users Management', href: '/users' }]}>
            <Head title="Users Management - SGLG-SYS" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                {/* Flash Banner */}
                {flash?.success && (
                    <div className="alert alert-success text-white text-xs font-semibold py-2.5 rounded-xl shadow-sm">
                        <CheckCircle2 className="size-4" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Header Title + Single-Line Action Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Users className="size-5 text-slate-600 dark:text-slate-300" /> User Accounts Management
                        </h1>
                        <p className="text-xs text-slate-500">
                            Manage accounts for DILG Evaluators, Checkers, and Barangay Secretaries
                        </p>
                    </div>

                    {/* Single Line Toolbar: Search + Role Filter + Add User button */}
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap shrink-0">
                        <div className="relative w-44 sm:w-60 shrink-0">
                            {isSearching ? (
                                <Loader2 className="absolute left-2.5 top-2.5 size-3.5 text-sky-500 animate-spin" />
                            ) : (
                                <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
                            )}
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search name or email..."
                                className="input input-sm input-bordered w-full pl-8 text-xs font-medium bg-white dark:bg-slate-900"
                            />
                        </div>

                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="select select-sm select-bordered text-xs font-medium bg-white dark:bg-slate-900 shrink-0 w-28 sm:w-32"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="checker">Checker</option>
                            <option value="barangay">Barangay</option>
                        </select>

                        <button
                            type="button"
                            onClick={openAddModal}
                            className="btn btn-sm btn-neutral text-xs font-semibold gap-1.5 rounded-lg px-3.5 shrink-0 whitespace-nowrap"
                        >
                            <Plus className="size-3.5" /> Add User
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table table-sm w-full">
                            <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 text-slate-500 text-[10px] uppercase tracking-wider">
                                <tr>
                                    <th>Full Name</th>
                                    <th>Email / Username</th>
                                    <th>Role</th>
                                    <th>Assigned Barangay</th>
                                    <th>Status</th>
                                    <th>Last Login</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-slate-400">
                                            No user accounts match your search criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                            <td className="font-semibold text-slate-900 dark:text-slate-100">
                                                {u.name}
                                                {u.phone && <div className="text-[10px] text-slate-400 font-normal">{u.phone}</div>}
                                            </td>
                                            <td>
                                                <div className="font-medium text-slate-700 dark:text-slate-300">{u.email}</div>
                                                <div className="text-[10px] text-slate-400">@{u.username || 'user'}</div>
                                            </td>
                                            <td>{getRoleBadge(u.role)}</td>
                                            <td className="text-slate-700 dark:text-slate-300">
                                                {u.barangay ? (
                                                    <div className="flex items-center gap-1 font-medium">
                                                        <Building2 className="size-3 text-slate-400" />
                                                        <span>{u.barangay.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic">DILG Office</span>
                                                )}
                                            </td>
                                            <td>
                                                {u.is_active ? (
                                                    <span className="badge badge-success badge-xs font-semibold text-white">ACTIVE</span>
                                                ) : (
                                                    <span className="badge badge-ghost badge-xs">INACTIVE</span>
                                                )}
                                            </td>
                                            <td className="text-slate-500 text-[11px]">
                                                {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="text-right space-x-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(u)}
                                                    className="btn btn-ghost btn-xs text-slate-600 hover:text-slate-900 gap-1"
                                                >
                                                    <Edit className="size-3" /> Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeletingUser(u)}
                                                    className="btn btn-ghost btn-xs text-rose-500 hover:text-rose-700 gap-1"
                                                >
                                                    <Trash2 className="size-3" /> Delete
                                                </button>
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
                            Showing <strong>{users.from || 0}</strong> to <strong>{users.to || 0}</strong> of <strong>{users.total}</strong> users (15 per page)
                        </div>

                        <div className="join">
                            {users.links.map((link, idx) => (
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

            {/* Add / Edit User Modal with First Name, Middle Initial (Optional), and Last Name */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 animate-in fade-in duration-150">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 bg-slate-900 text-white shrink-0">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <UserCheck className="size-4 text-sky-400" />
                                {editingUser ? `Edit User: ${editingUser.name}` : 'Create New User Account'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="btn btn-ghost btn-circle btn-xs text-white"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSaveUser} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
                            {/* First Name, Middle Initial (Optional), Last Name */}
                            <div className="grid grid-cols-12 gap-2.5">
                                <div className="col-span-12 sm:col-span-5">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        required
                                        placeholder="e.g. Jerome"
                                        className="input input-sm input-bordered w-full text-xs font-medium bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700"
                                    />
                                    {errors.first_name && <p className="text-rose-500 text-[10px] mt-0.5">{errors.first_name}</p>}
                                </div>

                                <div className="col-span-4 sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate" title="Middle Initial (Optional)">
                                        M.I. <span className="text-[10px] text-slate-400 font-normal">(Opt)</span>
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        value={data.middle_initial}
                                        onChange={(e) => setData('middle_initial', e.target.value)}
                                        placeholder="M."
                                        className="input input-sm input-bordered w-full text-xs font-medium bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700 text-center"
                                    />
                                </div>

                                <div className="col-span-8 sm:col-span-5">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        required
                                        placeholder="e.g. Lingan"
                                        className="input input-sm input-bordered w-full text-xs font-medium bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700"
                                    />
                                    {errors.last_name && <p className="text-rose-500 text-[10px] mt-0.5">{errors.last_name}</p>}
                                </div>
                            </div>

                            {/* Username & Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Username *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        required
                                        placeholder="username"
                                        className="input input-sm input-bordered w-full text-xs font-medium bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700"
                                    />
                                    {errors.username && <p className="text-rose-500 text-[10px] mt-0.5">{errors.username}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        placeholder="email@silang.gov.ph"
                                        className="input input-sm input-bordered w-full text-xs font-medium bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700"
                                    />
                                    {errors.email && <p className="text-rose-500 text-[10px] mt-0.5">{errors.email}</p>}
                                </div>
                            </div>

                            {/* Phone & Role */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="0917-xxx-xxxx"
                                        className="input input-sm input-bordered w-full text-xs font-medium bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Role *
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="select select-sm select-bordered w-full text-xs font-medium bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                                    >
                                        <option value="barangay">Barangay Submitter</option>
                                        <option value="checker">DILG Checker</option>
                                        <option value="admin">DILG Admin</option>
                                    </select>
                                </div>
                            </div>

                            {/* Assigned Barangay Searchable Dropdown */}
                            {data.role === 'barangay' && (
                                <div className="relative">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Assigned Barangay (64 LGUs) *
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => setIsBarangayDropdownOpen(!isBarangayDropdownOpen)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg hover:bg-white dark:bg-slate-800 dark:border-slate-700 text-left transition-colors"
                                    >
                                        <span className="truncate">
                                            {selectedBarangay
                                                ? `${selectedBarangay.name} (${selectedBarangay.code})`
                                                : 'Select a Barangay...'}
                                        </span>
                                        <ChevronDown className="size-3.5 text-slate-400 shrink-0" />
                                    </button>

                                    {isBarangayDropdownOpen && (
                                        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-lg dark:bg-slate-900 dark:border-slate-700 overflow-hidden animate-in fade-in duration-100">
                                            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                                                <div className="relative">
                                                    <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={barangaySearch}
                                                        onChange={(e) => setBarangaySearch(e.target.value)}
                                                        placeholder="Search among 64 Barangays..."
                                                        className="input input-xs input-bordered w-full pl-8 text-xs font-medium"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>

                                            <div className="max-h-40 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800 text-xs">
                                                {filteredBarangays.length === 0 ? (
                                                    <div className="p-3 text-center text-slate-400">
                                                        No barangays found.
                                                    </div>
                                                ) : (
                                                    filteredBarangays.map((b) => (
                                                        <button
                                                            key={b.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setData('barangay_id', b.id);
                                                                setIsBarangayDropdownOpen(false);
                                                            }}
                                                            className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                                                                Number(data.barangay_id) === b.id
                                                                    ? 'bg-slate-100 font-semibold text-slate-900 dark:bg-slate-800 dark:text-white'
                                                                    : 'text-slate-700 dark:text-slate-300'
                                                            }`}
                                                        >
                                                            <span>{b.name} <span className="text-[10px] text-slate-400 font-mono">({b.code})</span></span>
                                                            {Number(data.barangay_id) === b.id && (
                                                                <Check className="size-3.5 text-slate-900 dark:text-sky-400" />
                                                            )}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {errors.barangay_id && <p className="text-rose-500 text-[10px] mt-0.5">{errors.barangay_id}</p>}
                                </div>
                            )}

                            {/* Password fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        {editingUser ? 'Password (leave blank to keep)' : 'Password *'}
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required={!editingUser}
                                        placeholder="••••••••"
                                        className="input input-sm input-bordered w-full text-xs font-medium bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700"
                                    />
                                    {errors.password && <p className="text-rose-500 text-[10px] mt-0.5">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required={!editingUser}
                                        placeholder="••••••••"
                                        className="input input-sm input-bordered w-full text-xs font-medium bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700"
                                    />
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn btn-xs btn-ghost"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn btn-sm btn-neutral text-xs font-semibold rounded-lg px-4"
                                >
                                    {processing ? <span className="loading loading-spinner loading-xs" /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Alert Modal */}
            {deletingUser && (
                <AlertModal
                    isOpen={Boolean(deletingUser)}
                    onClose={() => setDeletingUser(null)}
                    onConfirm={handleDeleteUser}
                    type="error"
                    title="Confirm User Deletion"
                    description={`Are you sure you want to delete "${deletingUser.name}" (${deletingUser.email})?`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    showCancel={true}
                />
            )}
        </AppSidebarLayout>
    );
}
