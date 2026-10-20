'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import AuthShell from '@/components/auth/auth-shell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function ResetPasswordForm() {
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get('token');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!token) return;
        const newPassword = String(new FormData(e.currentTarget).get('password'));
        setError(null);
        setLoading(true);
        const { error } = await authClient.resetPassword({ newPassword, token });
        setLoading(false);
        if (error) return setError(error.message ?? 'This link is invalid or has expired.');
        router.push('/sign-in');
    };

    return (
        <AuthShell>
        <div className='w-full max-w-sm'>
            <h1 className='text-3xl font-bold tracking-tight'>Choose a new password</h1>
            {!token || params.get('error') ? (
                <p className='mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
                    This reset link is invalid or has expired.{' '}
                    <Link href='/forgot-password' className='font-medium underline'>Request a new one</Link>
                </p>
            ) : (
                <form onSubmit={onSubmit} className='mt-6 flex flex-col gap-4'>
                    <Input name='password' type='password' placeholder='At least 8 characters' minLength={8} className='h-11' required autoComplete='new-password' />
                    {error && <p role='alert' className='text-sm text-red-600'>{error}</p>}
                    <Button type='submit' size='lg' disabled={loading}>
                        {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Update password
                    </Button>
                </form>
            )}
        </div>
        </AuthShell>
    );
}

export default ResetPasswordForm;
