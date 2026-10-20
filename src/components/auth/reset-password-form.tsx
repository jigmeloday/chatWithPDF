'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { friendlyError } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';
import AuthShell from '@/components/auth/auth-shell';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';

function ResetPasswordForm() {
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get('token');
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const invalid = !token || !!params.get('error');

    useEffect(() => {
        if (invalid) toast({ title: 'This reset link is invalid or has expired', description: 'Request a new one to continue.', variant: 'destructive' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invalid]);

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!token) return;
        const newPassword = String(new FormData(e.currentTarget).get('password'));
        setLoading(true);
        const { error } = await authClient.resetPassword({ newPassword, token });
        setLoading(false);
        if (error) {
            toast({ title: 'Could not reset your password', description: friendlyError(error.message, 'This link is invalid or has expired.'), variant: 'destructive' });
            return;
        }
        toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
        router.push('/sign-in');
    };

    return (
        <AuthShell>
        <div className='w-full max-w-sm'>
            <h1 className='text-3xl font-bold tracking-tight'>Choose a new password</h1>
            {invalid ? (
                <Link href='/forgot-password' className={buttonVariants({ size: 'lg', className: 'mt-6 w-full' })}>
                    Request a new link
                </Link>
            ) : (
                <form onSubmit={onSubmit} className='mt-6 flex flex-col gap-4'>
                    <Input name='password' type='password' placeholder='At least 8 characters' minLength={8} className='h-11' required autoComplete='new-password' />
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
