'use client';
import { FormEvent, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2, Lock, LifeBuoy, User } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { EASE } from '@/components/motion';
import { useToast } from '@/hooks/use-toast';
import { SUPPORT_EMAIL } from '@/config/site';
import { cn } from '@/lib/utils';

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'help', label: 'Help', icon: LifeBuoy },
    { id: 'danger', label: 'Danger zone', icon: AlertTriangle },
] as const;
type Tab = (typeof TABS)[number]['id'];

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
    return (
        <label className='block'>
            <span className='text-sm font-medium text-zinc-800'>{label}</span>
            <div className='mt-1.5'>{children}</div>
            {hint && <span className='mt-1 block text-xs text-zinc-500'>{hint}</span>}
        </label>
    );
}

function Panel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
    return (
        <div className='rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-950/5'>
            <h2 className='text-lg font-semibold text-zinc-900'>{title}</h2>
            <p className='mt-1 text-sm text-zinc-500'>{description}</p>
            <div className='mt-6'>{children}</div>
        </div>
    );
}

function Settings({ name, email }: { name: string; email: string }) {
    const router = useRouter();
    const { toast } = useToast();
    const [tab, setTab] = useState<Tab>('profile');
    const [busy, setBusy] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const run = async (key: string, fn: () => Promise<{ error: { message?: string } | null }>, success: string) => {
        setBusy(key);
        const { error } = await fn();
        setBusy(null);
        if (error) {
            toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' });
            return false;
        }
        toast({ title: success });
        router.refresh();
        return true;
    };

    const saveProfile = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newName = String(new FormData(e.currentTarget).get('name')).trim();
        return run('profile', () => authClient.updateUser({ name: newName }), 'Profile updated');
    };

    const changePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        const ok = await run(
            'password',
            () => authClient.changePassword({ currentPassword: String(data.get('current')), newPassword: String(data.get('next')), revokeOtherSessions: true }),
            'Password changed'
        );
        if (ok) form.reset();
    };

    const deleteAccount = async () => {
        setBusy('delete');
        const { error } = await authClient.deleteUser();
        setBusy(null);
        if (error) return toast({ title: 'Could not delete account', description: error.message, variant: 'destructive' });
        window.location.href = '/';
    };

    return (
        <main className='mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8'>
            <p className='text-sm font-medium text-green-700'>Account</p>
            <h1 className='mt-1 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl'>Settings</h1>

            <div className='mt-6 flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-950/5'>
                <span className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-700 text-xl font-semibold text-white shadow-sm'>
                    {(name || email).charAt(0).toUpperCase()}
                </span>
                <div className='min-w-0'>
                    <p className='truncate text-lg font-semibold text-zinc-900'>{name || 'Your account'}</p>
                    <p className='truncate text-sm text-zinc-500'>{email}</p>
                </div>
            </div>

            <div role='tablist' className='mt-6 flex gap-1 overflow-x-auto border-b border-zinc-200'>
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        role='tab'
                        aria-selected={tab === id}
                        onClick={() => setTab(id)}
                        className={cn(
                            'relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                            tab === id ? (id === 'danger' ? 'text-red-600' : 'text-green-800') : 'text-zinc-500 hover:text-zinc-900'
                        )}>
                        <Icon className='h-4 w-4' /> {label}
                        {tab === id && (
                            <motion.span
                                layoutId='settings-tab'
                                className={cn('absolute inset-x-0 -bottom-px h-0.5 rounded-full', id === 'danger' ? 'bg-red-500' : 'bg-green-600')}
                                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className='mt-6'>
                    {tab === 'profile' && (
                        <Panel title='Profile' description='Your name appears in the sidebar and greeting.'>
                            <form onSubmit={saveProfile} className='max-w-md space-y-5'>
                                <Field label='Name'>
                                    <Input name='name' defaultValue={name} required className='h-10' />
                                </Field>
                                <Field label='Email' hint='Your email is used to sign in and can’t be changed here.'>
                                    <Input value={email} disabled className='h-10' />
                                </Field>
                                <Button type='submit' disabled={busy === 'profile'}>
                                    {busy === 'profile' && <Loader2 className='mr-2 h-4 w-4 animate-spin' />} Save changes
                                </Button>
                            </form>
                        </Panel>
                    )}

                    {tab === 'security' && (
                        <Panel title='Password' description='Changing it signs you out of your other devices.'>
                            <form onSubmit={changePassword} className='max-w-md space-y-5'>
                                <Field label='Current password'>
                                    <Input name='current' type='password' autoComplete='current-password' required className='h-10' />
                                </Field>
                                <Field label='New password' hint='At least 8 characters.'>
                                    <Input name='next' type='password' minLength={8} autoComplete='new-password' required className='h-10' />
                                </Field>
                                <Button type='submit' disabled={busy === 'password'}>
                                    {busy === 'password' && <Loader2 className='mr-2 h-4 w-4 animate-spin' />} Update password
                                </Button>
                            </form>
                        </Panel>
                    )}

                    {tab === 'help' && (
                        <Panel title='Help and feedback' description='Questions, problems or ideas? We read every message.'>
                            <a href={`mailto:${SUPPORT_EMAIL}`} className='text-sm font-medium text-green-700 hover:underline'>
                                {SUPPORT_EMAIL}
                            </a>
                        </Panel>
                    )}

                    {tab === 'danger' && (
                        <div className='rounded-2xl bg-white p-6 shadow-sm ring-1 ring-red-200'>
                            <h2 className='text-lg font-semibold text-red-700'>Delete account</h2>
                            <p className='mt-1 text-sm text-zinc-600'>
                                Permanently removes your account, documents, chats, saved answers, API keys and webhooks. This can&apos;t be undone.
                            </p>
                            <Button variant='destructive' className='mt-6' onClick={() => setConfirmDelete(true)}>
                                Delete my account
                            </Button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <DialogContent>
                    <DialogTitle>Delete your account?</DialogTitle>
                    <DialogDescription>This can&apos;t be undone. All your documents and chat history will be permanently deleted.</DialogDescription>
                    <DialogFooter className='gap-2'>
                        <Button variant='outline' onClick={() => setConfirmDelete(false)}>Cancel</Button>
                        <Button variant='destructive' disabled={busy === 'delete'} onClick={deleteAccount}>
                            {busy === 'delete' && <Loader2 className='mr-2 h-4 w-4 animate-spin' />} Delete account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}

export default Settings;
