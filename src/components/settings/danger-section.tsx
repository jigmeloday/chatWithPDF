'use client';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { friendlyError } from '@/lib/errors';
import { ConfirmDialog, SettingsCard } from './ui';

export default function DangerSection({ email }: { email: string }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);

    const remove = async () => {
        setBusy(true);
        const { error } = await authClient.deleteUser();
        setBusy(false);
        if (error) return toast({ title: 'Could not delete account', description: friendlyError(error.message), variant: 'destructive' });
        window.location.href = '/';
    };

    return (
        <>
            <SettingsCard
                danger
                title='Delete account'
                description='Permanently removes your account, documents, chats, saved answers, API keys and webhooks. This can’t be undone.'
                footer={
                    <>
                        <span className='text-xs text-red-700/80'>Export your data first if you want a copy.</span>
                        <Button size='sm' variant='destructive' onClick={() => setOpen(true)}>Delete my account</Button>
                    </>
                }>
                <p className='text-sm text-zinc-600'>
                    Your subscription, if any, should be cancelled from <b>Billing</b> before you delete your account.
                </p>
            </SettingsCard>
            <ConfirmDialog
                open={open}
                onClose={() => setOpen(false)}
                title='Delete your account?'
                description='All your documents and chat history will be permanently deleted.'
                confirmLabel='Delete account'
                requireText={email}
                loading={busy}
                onConfirm={remove}
            />
        </>
    );
}
