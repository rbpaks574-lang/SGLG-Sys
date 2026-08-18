import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm();

    const handleResend = (e: FormEvent) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    return (
        <div className="space-y-6 text-center">
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-emerald-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={handleResend} className="space-y-6">
                <Button type="submit" disabled={processing} variant="secondary" className="w-full">
                    {processing && <Spinner />}
                    Resend verification email
                </Button>

                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="mx-auto block text-sm text-slate-500 hover:underline"
                >
                    Log out
                </Link>
            </form>
        </div>
    );
}

VerifyEmail.layout = {
    title: 'Email verification',
    description:
        'Please verify your email address by clicking on the link we just emailed to you.',
};
