'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <section className='rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-950/5'>
            <h2 className='text-lg font-semibold text-zinc-900'>{title}</h2>
            <p className='mt-1 text-sm text-zinc-500'>{description}</p>
            <div className='mt-5'>{children}</div>
        </section>
    );
}

function Settings({ name, email }: { name: string; email: string }) {
    const router = useRouter();
    const { toast } = useToast();
    const { data: usage } = trpc.getUsage.useQuery();
    const [busy, setBusy] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const run = async (key: string, fn: () => Promise<{ error: { message?: string } | null }>, success: string) => {
        setBusy(key);
        const { error } = await fn();
        setBusy(null);
        if (error) return toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' });
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
            () =>
                authClient.changePassword({
                    currentPassword: String(data.get('current')),
                    newPassword: String(data.get('next')),
                    revokeOtherSessions: true,
                }),
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
        <main className='mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-8 md:py-8'>
            <div>
                <p className='text-sm font-medium text-green-700'>Account</p>
                <h1 className='mt-1 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl'>Settings</h1>
            </div>

            <Section title='Profile' description='Your name appears in the sidebar and greeting.'>
                <form onSubmit={saveProfile} className='flex max-w-md flex-col gap-3'>
                    <label className='text-sm font-medium text-zinc-700'>Email
                        <Input value={email} disabled className='mt-1.5 h-10' />
                    </label>
                    <label className='text-sm font-medium text-zinc-700'>Name
                        <Input name='name' defaultValue={name} required className='mt-1.5 h-10' />
                    </label>
                    <Button type='submit' disabled={busy === 'profile'} className='w-fit'>
                        {busy === 'profile' && <Loader2 className='mr-2 h-4 w-4 animate-spin' />} Save changes
                    </Button>
                </form>
            </Section>

            <Section title='Plan' description='Your current subscription and what it includes.'>
                {usage ? (
                    <dl className='grid grid-cols-2 gap-4 text-sm sm:grid-cols-4'>
                        <div><dt className='text-zinc-500'>Plan</dt><dd className='mt-1 font-semibold'>{usage.plan.name}</dd></div>
                        <div><dt className='text-zinc-500'>Renews</dt><dd className='mt-1 font-semibold'>{format(new Date(usage.periodEnd), 'MMM d, yyyy')}</dd></div>
                        <div><dt className='text-zinc-500'>Tokens</dt><dd className='mt-1 font-semibold'>{usage.tokensUsed.toLocaleString()} / {usage.tokenLimit.toLocaleString()}</dd></div>
                        <div><dt className='text-zinc-500'>Documents</dt><dd className='mt-1 font-semibold'>{usage.documentsUsed} / {usage.documentLimit}</dd></div>
                    </dl>
                ) : (
                    <p className='text-sm text-zinc-500'>Loading…</p>
                )}
            </Section>

            <Section title='Password' description='Changing it signs you out of your other devices.'>
                <form onSubmit={changePassword} className='flex max-w-md flex-col gap-3'>
                    <Input name='current' type='password' placeholder='Current password' autoComplete='current-password' required className='h-10' />
                    <Input name='next' type='password' placeholder='New password (8+ characters)' minLength={8} autoComplete='new-password' required className='h-10' />
                    <Button type='submit' disabled={busy === 'password'} className='w-fit'>
                        {busy === 'password' && <Loader2 className='mr-2 h-4 w-4 animate-spin' />} Update password
                    </Button>
                </form>
            </Section>

            <Section title='Delete account' description='Permanently removes your account, documents, chats and API keys.'>
                <Button variant='destructive' onClick={() => setConfirmDelete(true)}>Delete my account</Button>
            </Section>

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
