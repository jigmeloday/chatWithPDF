'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import AuthShell from '@/components/auth/auth-shell';
import { authClient } from '@/lib/auth-client';
import { friendlyError } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AuthFormProps {
    mode: 'sign-in' | 'sign-up';
}


function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className='flex flex-col gap-1.5 text-sm font-medium text-zinc-700'>
            {label}
            {children}
        </label>
    );
}

function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const origin = useSearchParams().get('origin');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isSignUp = mode === 'sign-up';
    const query = origin ? `?origin=${encodeURIComponent(origin)}` : '';

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formEl = e.currentTarget;
        const form = new FormData(formEl);
        const email = String(form.get('email'));
        const password = String(form.get('password'));
        const name = String(form.get('name') ?? '');

        setLoading(true);
        const { error } = isSignUp
            ? await authClient.signUp.email({ email, password, name })
            : await authClient.signIn.email({ email, password });
        setLoading(false);

        if (error) {
            toast({
                title: isSignUp ? 'Could not create your account' : 'Could not sign you in',
                description: friendlyError(error.message),
                variant: 'destructive',
            });
            return;
        }

        // With email verification on, sign-up doesn't start a session until the link is clicked.
        if (isSignUp && !(await authClient.getSession()).data) {
            toast({ title: 'Check your inbox', description: `We sent a verification link to ${email}. Click it to finish creating your account.` });
            formEl.reset();
            return;
        }
        toast({ title: isSignUp ? 'Account created' : 'Welcome back' });
        router.push(`/auth-callback${query}`);
        router.refresh();
    };

    return (
        <AuthShell>
            <div className='w-full max-w-sm'>
                    <h1 className='text-3xl font-bold tracking-tight'>
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                    </h1>
                    <p className='mt-2 text-sm text-zinc-500'>
                        {isSignUp
                            ? 'Start chatting with your PDFs in under a minute.'
                            : 'Sign in to pick up where you left off.'}
                    </p>

                    <form onSubmit={onSubmit} className='mt-8 flex flex-col gap-4'>
                        {isSignUp && (
                            <Field label='Name'>
                                <Input
                                    name='name'
                                    autoComplete='name'
                                    placeholder='Jane Doe'
                                    className='h-11'
                                    required
                                />
                            </Field>
                        )}
                        <Field label='Email'>
                            <Input
                                name='email'
                                type='email'
                                autoComplete='email'
                                placeholder='you@example.com'
                                className='h-11'
                                required
                            />
                        </Field>
                        <Field label='Password'>
                            <div className='relative'>
                                <Input
                                    name='password'
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                    placeholder={isSignUp ? 'At least 8 characters' : 'Your password'}
                                    minLength={8}
                                    className='h-11 pr-10'
                                    required
                                />
                                <button
                                    type='button'
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className='absolute inset-y-0 right-0 flex w-10 items-center justify-center text-zinc-400 hover:text-zinc-700'>
                                    {showPassword ? (
                                        <EyeOff className='h-4 w-4' />
                                    ) : (
                                        <Eye className='h-4 w-4' />
                                    )}
                                </button>
                            </div>
                        </Field>

                        {!isSignUp && (
                            <Link href='/forgot-password' className='-mt-2 self-end text-sm text-green-700 hover:underline'>
                                Forgot password?
                            </Link>
                        )}

                        <Button type='submit' size='lg' disabled={loading} className='mt-2'>
                            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            {isSignUp ? 'Create account' : 'Sign in'}
                        </Button>
                    </form>

                    <p className='mt-6 text-center text-sm text-zinc-600'>
                        {isSignUp ? 'Already have an account?' : 'New to Otterly?'}{' '}
                        <Link
                            className='font-medium text-green-700 hover:underline'
                            href={`/${isSignUp ? 'sign-in' : 'sign-up'}${query}`}>
                            {isSignUp ? 'Sign in' : 'Create an account'}
                        </Link>
                    </p>
            </div>
        </AuthShell>
    );
}

export default AuthForm;
