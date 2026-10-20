'use client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Globe, Laptop, Loader2, LogOut, Smartphone } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { friendlyError } from '@/lib/errors';
import { Field, SaveButton, SettingsCard } from './ui';

interface SessionRow {
    id: string;
    token: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
}

const describeDevice = (ua?: string | null) => {
    if (!ua) return { label: 'Unknown device', mobile: false };
    const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
    const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'Unknown OS';
    return { label: `${browser} on ${os}`, mobile: /iPhone|Android|Mobile/.test(ua) };
};

export default function SecuritySection() {
    const { toast } = useToast();
    const [sessions, setSessions] = useState<SessionRow[] | null>(null);
    const [currentToken, setCurrentToken] = useState<string | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [changing, setChanging] = useState(false);

    const load = useCallback(async () => {
        const [list, current] = await Promise.all([authClient.listSessions(), authClient.getSession()]);
        if (list.error) toast({ title: 'Could not load your sessions', description: friendlyError(list.error.message), variant: 'destructive' });
        setSessions((list.data as SessionRow[] | null) ?? []);
        setCurrentToken(current.data?.session.token ?? null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const changePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        setChanging(true);
        const { error } = await authClient.changePassword({
            currentPassword: String(data.get('current')),
            newPassword: String(data.get('next')),
            revokeOtherSessions: true,
        });
        setChanging(false);
        if (error) return toast({ title: 'Could not change password', description: friendlyError(error.message), variant: 'destructive' });
        form.reset();
        toast({ title: 'Password changed', description: 'Other devices were signed out.' });
        load();
    };

    const revoke = async (token: string) => {
        setBusy(token);
        const { error } = await authClient.revokeSession({ token });
        setBusy(null);
        if (error) return toast({ title: 'Could not sign out that device', description: friendlyError(error.message), variant: 'destructive' });
        toast({ title: 'Device signed out' });
        load();
    };

    const revokeOthers = async () => {
        setBusy('others');
        const { error } = await authClient.revokeOtherSessions();
        setBusy(null);
        if (error) return toast({ title: 'Could not sign out other devices', description: friendlyError(error.message), variant: 'destructive' });
        toast({ title: 'Signed out of all other devices' });
        load();
    };

    const others = (sessions ?? []).filter((s) => s.token !== currentToken);

    return (
        <div className='space-y-6'>
            <form onSubmit={changePassword}>
                <SettingsCard
                    title='Password'
                    description='Use at least 8 characters. Changing your password signs you out everywhere else.'
                    footer={
                        <>
                            <span className='text-xs text-zinc-500'>Forgot it? Use “Forgot password” on the sign-in page.</span>
                            <SaveButton loading={changing}>Update password</SaveButton>
                        </>
                    }>
                    <div className='grid gap-5 md:grid-cols-2'>
                        <Field label='Current password'>
                            <Input name='current' type='password' autoComplete='current-password' required className='h-10' />
                        </Field>
                        <Field label='New password'>
                            <Input name='next' type='password' minLength={8} autoComplete='new-password' required className='h-10' />
                        </Field>
                    </div>
                </SettingsCard>
            </form>

            <SettingsCard
                title='Active sessions'
                description='Everywhere you’re signed in. Sign out any device you don’t recognise.'
                footer={
                    <>
                        <span className='text-xs text-zinc-500'>{sessions ? `${sessions.length} active session${sessions.length === 1 ? '' : 's'}` : ''}</span>
                        <Button size='sm' variant='outline' disabled={!others.length || busy === 'others'} onClick={revokeOthers}>
                            {busy === 'others' ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <LogOut className='mr-2 h-4 w-4' />} Sign out all other devices
                        </Button>
                    </>
                }>
                {!sessions ? (
                    <p className='text-sm text-zinc-500'>Loading…</p>
                ) : (
                    <ul className='divide-y divide-zinc-100'>
                        {sessions.map((s) => {
                            const d = describeDevice(s.userAgent);
                            const isCurrent = s.token === currentToken;
                            const Icon = d.mobile ? Smartphone : Laptop;
                            return (
                                <li key={s.id} className='flex items-center gap-4 py-3 first:pt-0 last:pb-0'>
                                    <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600'>
                                        <Icon className='h-5 w-5' />
                                    </span>
                                    <div className='min-w-0 flex-1'>
                                        <p className='flex items-center gap-2 text-sm font-medium text-zinc-900'>
                                            {d.label}
                                            {isCurrent && <span className='rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-600/20'>This device</span>}
                                        </p>
                                        <p className='flex items-center gap-1.5 text-xs text-zinc-500'>
                                            <Globe className='h-3 w-3' /> {s.ipAddress || 'Unknown IP'} · signed in {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!isCurrent && (
                                        <Button size='sm' variant='ghost' disabled={busy === s.token} onClick={() => revoke(s.token)} className='text-zinc-600 hover:bg-red-50 hover:text-red-600'>
                                            {busy === s.token ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Sign out'}
                                        </Button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </SettingsCard>
        </div>
    );
}
