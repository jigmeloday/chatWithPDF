'use client';
import { trpc } from '@/app/_trpc/client';
import { useToast } from '@/hooks/use-toast';
import { SettingsCard, Switch } from './ui';

const ROWS = [
    { key: 'notifyDocReady', title: 'Document is ready', text: 'Email me when a document finishes processing and can be chatted with.' },
    { key: 'notifyDocFailed', title: 'Processing fails', text: 'Email me when a document can’t be processed, with the reason.' },
] as const;

export default function NotificationsSection() {
    const { toast } = useToast();
    const utils = trpc.useContext();
    const { data } = trpc.getPreferences.useQuery();
    const { mutate, variables, isLoading } = trpc.updatePreferences.useMutation({
        onSuccess: () => {
            utils.getPreferences.invalidate();
            toast({ title: 'Notification settings saved' });
        },
    });

    return (
        <SettingsCard title='Email notifications' description='Choose when Otterly emails you. Changes save immediately.'>
            <ul className='divide-y divide-zinc-100'>
                {ROWS.map((r) => (
                    <li key={r.key} className='flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0'>
                        <div>
                            <p className='font-medium text-zinc-900'>{r.title}</p>
                            <p className='text-sm text-zinc-500'>{r.text}</p>
                        </div>
                        <Switch
                            label={r.title}
                            checked={isLoading && variables && r.key in variables ? !!variables[r.key] : !!data?.[r.key]}
                            disabled={!data}
                            onChange={(v) => mutate({ [r.key]: v })}
                        />
                    </li>
                ))}
            </ul>
        </SettingsCard>
    );
}
