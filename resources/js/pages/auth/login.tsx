import { FormEvent, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    Lock,
    Mail,
    ArrowRight,
    Shield,
    Eye,
    EyeOff,
} from 'lucide-react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-slate-800 selection:text-white">
            <Head title="Sign In - SGLG-SYS Document Portal" />

            {/* Centered Login Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                {/* Header Banner */}
                <div className="p-6 pb-5 border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-850 text-center space-y-2">
                    <div className="inline-flex size-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm dark:bg-slate-800">
                        <Shield className="size-6 text-sky-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                            SGLG-SYS SILANG
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Document Compliance Portal Authentication
                        </p>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Official Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="account@silang.gov.ph"
                                    className="input input-sm input-bordered w-full pl-9 text-xs font-medium bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="input input-sm input-bordered w-full pl-9 pr-9 text-xs font-medium bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember checkbox */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="checkbox checkbox-xs checkbox-neutral"
                                />
                                <span className="text-xs text-slate-600 dark:text-slate-400">Remember my session</span>
                            </label>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn btn-sm btn-neutral w-full text-xs font-semibold gap-2 rounded-xl mt-2 shadow-sm"
                        >
                            {processing ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="size-3.5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Info */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400 dark:border-slate-800 dark:bg-slate-850">
                    <span>Department of the Interior and Local Government — Silang, Cavite</span>
                </div>
            </div>
        </div>
    );
}

Login.layout = null;
