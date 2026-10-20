'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, FileText, Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AuthFormProps {
    mode: 'sign-in' | 'sign-up';
}

const HIGHLIGHTS = [
    { icon: FileText, text: 'Upload any PDF in seconds' },
    { icon: MessageCircle, text: 'Ask questions in plain language' },
    { icon: Sparkles, text: 'Get answers grounded in your document' },
];

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
    const origin = useSearchParams().get('origin');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
    const isSignUp = mode === 'sign-up';
    const query = origin ? `?origin=${encodeURIComponent(origin)}` : '';

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const email = String(form.get('email'));
        const password = String(form.get('password'));
        const name = String(form.get('name') ?? '');

        setError(null);
        setLoading(true);
        const { error } = isSignUp
            ? await authClient.signUp.email({ email, password, name })
            : await authClient.signIn.email({ email, password });
        setLoading(false);

        if (error) {
            setError(error.message ?? 'Something went wrong');
            return;
        }

        // With email verification on, sign-up doesn't start a session until the link is clicked.
        if (isSignUp && !(await authClient.getSession()).data) {
            setVerifyEmail(email);
            return;
        }
        router.push(`/auth-callback${query}`);
        router.refresh();
    };

    return (
        <div className='grid min-h-[calc(100vh-3.5rem)] lg:grid-cols-2'>
            <aside className='hidden flex-col justify-center gap-8 bg-gradient-to-br from-green-600 to-green-900 px-16 text-white lg:flex'>
                <div>
                    <h2 className='text-4xl font-bold leading-tight'>
                        Chat with your documents.
                    </h2>
                    <p className='mt-3 max-w-md text-green-100'>
                        DocuChatty turns any PDF into a conversation, so you find what
                        you need without scrolling through pages.
                    </p>
                </div>
                <ul className='flex flex-col gap-4'>
                    {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                        <li key={text} className='flex items-center gap-3'>
                            <span className='flex h-9 w-9 items-center justify-center rounded-lg bg-white/15'>
                                <Icon className='h-5 w-5' />
                            </span>
                            {text}
                        </li>
                    ))}
                </ul>
            </aside>

            <main className='flex items-center justify-center px-4 py-12'>
                <div className='w-full max-w-sm'>
                    <h1 className='text-3xl font-bold tracking-tight'>
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                    </h1>
                    <p className='mt-2 text-sm text-zinc-500'>
                        {isSignUp
                            ? 'Start chatting with your PDFs in under a minute.'
                            : 'Sign in to pick up where you left off.'}
                    </p>

                    {verifyEmail ? (
                        <div className='mt-8 rounded-xl border border-green-200 bg-green-50 p-5 text-sm text-green-900'>
                            <p className='font-semibold'>Check your inbox</p>
                            <p className='mt-1'>
                                We sent a verification link to <b>{verifyEmail}</b>. Click it to finish creating your account.
                            </p>
                        </div>
                    ) : (
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

                        {error && (
                            <p
                                role='alert'
                                className='rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
                                {error}
                            </p>
                        )}

                        <Button type='submit' size='lg' disabled={loading} className='mt-2'>
                            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            {isSignUp ? 'Create account' : 'Sign in'}
                        </Button>
                    </form>
                    )}

                    <p className='mt-6 text-center text-sm text-zinc-600'>
                        {isSignUp ? 'Already have an account?' : 'New to DocuChatty?'}{' '}
                        <Link
                            className='font-medium text-green-700 hover:underline'
                            href={`/${isSignUp ? 'sign-in' : 'sign-up'}${query}`}>
                            {isSignUp ? 'Sign in' : 'Create an account'}
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}

export default AuthForm;
