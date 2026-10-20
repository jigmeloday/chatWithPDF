'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { friendlyError } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';
import AuthShell from '@/components/auth/auth-shell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function ForgotPasswordForm() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formEl = e.currentTarget;
        const email = String(new FormData(formEl).get('email'));
        setLoading(true);
        const { error } = await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' });
        setLoading(false);
        // Rate limits and network errors are worth telling the user about; "no such account" is never revealed.
        if (error?.status === 429 || (error && !error.status)) {
            toast({ title: 'Could not send the reset link', description: friendlyError(error.message, 'Please try again in a minute.'), variant: 'destructive' });
            return;
        }
        toast({ title: 'Check your inbox', description: 'If an account exists for that email, a reset link is on its way.' });
        // Same message whether or not the account exists, so emails can't be probed.
        formEl.reset();
    };

    return (
        <AuthShell>
        <div className='w-full max-w-sm'>
            <h1 className='text-3xl font-bold tracking-tight'>Reset your password</h1>
            <p className='mt-2 text-sm text-zinc-500'>Enter your email and we&apos;ll send you a reset link.</p>
            <form onSubmit={onSubmit} className='mt-6 flex flex-col gap-4'>
                <Input name='email' type='email' placeholder='you@example.com' className='h-11' required />
                <Button type='submit' size='lg' disabled={loading}>
                    {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    Send reset link
                </Button>
            </form>
            <Link href='/sign-in' className='mt-8 block text-sm text-green-700 hover:underline'>
                Back to sign in
            </Link>
        </div>
        </AuthShell>
    );
}

export default ForgotPasswordForm;
