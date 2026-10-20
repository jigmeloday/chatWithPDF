'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function ForgotPasswordForm() {
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const email = String(new FormData(e.currentTarget).get('email'));
        setLoading(true);
        await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' });
        setLoading(false);
        // Same message whether or not the account exists, so emails can't be probed.
        setSent(true);
    };

    return (
        <div className='mx-auto mt-24 w-full max-w-sm px-4'>
            <h1 className='text-3xl font-bold tracking-tight'>Reset your password</h1>
            {sent ? (
                <p className='mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900'>
                    If an account exists for that email, a reset link is on its way.
                </p>
            ) : (
                <>
                    <p className='mt-2 text-sm text-zinc-500'>Enter your email and we&apos;ll send you a reset link.</p>
                    <form onSubmit={onSubmit} className='mt-6 flex flex-col gap-4'>
                        <Input name='email' type='email' placeholder='you@example.com' className='h-11' required />
                        <Button type='submit' size='lg' disabled={loading}>
                            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            Send reset link
                        </Button>
                    </form>
                </>
            )}
            <Link href='/sign-in' className='mt-6 block text-sm text-green-700 hover:underline'>
                Back to sign in
            </Link>
        </div>
    );
}

export default ForgotPasswordForm;
