'use client';
import { FormEvent, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, Copy, Loader2, Pause, Play, Send, Trash, Webhook } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stagger, StaggerItem } from '@/components/motion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const EVENTS = [
    { value: 'document.ready', label: 'document.ready', hint: 'A document finished processing' },
    { value: 'document.failed', label: 'document.failed', hint: 'A document could not be processed' },
] as const;

const VERIFY_SNIPPET = `import crypto from 'crypto';

// Header: Otterly-Signature: t=1700000000,v1=<hex>
function verify(rawBody, header, secret) {
  const { t, v1 } = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false; // reject replays
  const expected = crypto.createHmac('sha256', secret).update(\`\${t}.\${rawBody}\`).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
}`;

function SecretBanner({ secret }: { secret: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <div className='rounded-xl border border-green-200 bg-green-50 p-4'>
            <p className='text-sm font-medium text-green-900'>Copy your signing secret now. You won&apos;t be able to see it again.</p>
            <div className='mt-3 flex items-center gap-2'>
                <code className='flex-1 truncate rounded-md bg-white px-3 py-2 text-sm'>{secret}</code>
                <Button
                    size='sm'
                    variant='outline'
                    aria-label='Copy secret'
                    onClick={async () => {
                        await navigator.clipboard.writeText(secret);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}>
                    {copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
                </Button>
            </div>
        </div>
    );
}

function Webhooks() {
    const { toast } = useToast();
    const utils = trpc.useContext();
    const { data: endpoints, isLoading } = trpc.listWebhooks.useQuery();
    const [url, setUrl] = useState('');
    const [events, setEvents] = useState<string[]>(EVENTS.map((e) => e.value));
    const [secret, setSecret] = useState<string | null>(null);
    const [testingId, setTestingId] = useState<string | null>(null);

    const refresh = () => utils.listWebhooks.invalidate();
    const { mutate: create, isLoading: creating } = trpc.createWebhook.useMutation({
        onSuccess: ({ secret }) => {
            setSecret(secret);
            setUrl('');
            refresh();
            toast({ title: 'Endpoint added', description: 'Copy the signing secret below. It is only shown once.' });
        },
    });
    const { mutate: setActive } = trpc.setWebhookActive.useMutation({
        onSuccess: (_d, v) => {
            refresh();
            toast({ title: v.active ? 'Endpoint resumed' : 'Endpoint paused' });
        },
    });
    const { mutate: remove } = trpc.deleteWebhook.useMutation({
        onSuccess: () => {
            refresh();
            toast({ title: 'Endpoint deleted' });
        },
    });
    const { mutateAsync: test } = trpc.testWebhook.useMutation();

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        setSecret(null);
        create({ url, events: events as ('document.ready' | 'document.failed')[] });
    };

    const sendTest = async (id: string) => {
        setTestingId(id);
        try {
            const r = await test({ id });
            toast(
                r.ok
                    ? { title: 'Test delivered', description: `Your endpoint responded with ${r.status}.` }
                    : { title: 'Test failed', description: r.error ?? 'No response', variant: 'destructive' }
            );
        } finally {
            setTestingId(null);
            refresh();
        }
    };

    return (
        <main className='mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8'>
            <p className='text-sm font-medium text-green-700'>Developers</p>
            <h1 className='mt-1 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl'>Webhooks</h1>
            <p className='mt-1 text-zinc-500'>Get a signed HTTP request when something happens, instead of polling the API.</p>

            <section className='mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-950/5'>
                <h2 className='font-semibold text-zinc-900'>Add an endpoint</h2>
                <form onSubmit={onSubmit} className='mt-4 space-y-4'>
                    <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder='https://example.com/otterly-webhook'
                        type='url'
                        required
                        className='h-10'
                    />
                    <div className='flex flex-wrap gap-2'>
                        {EVENTS.map((e) => {
                            const on = events.includes(e.value);
                            return (
                                <button
                                    type='button'
                                    key={e.value}
                                    title={e.hint}
                                    onClick={() => setEvents((s) => (on ? s.filter((x) => x !== e.value) : [...s, e.value]))}
                                    className={cn(
                                        'rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition',
                                        on ? 'bg-green-50 text-green-800 ring-green-600/30' : 'bg-white text-zinc-500 ring-zinc-950/10 hover:bg-zinc-50'
                                    )}>
                                    {e.label}
                                </button>
                            );
                        })}
                    </div>
                    <Button type='submit' disabled={creating || !events.length}>
                        {creating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />} Add endpoint
                    </Button>
                </form>
                {secret && <div className='mt-4'><SecretBanner secret={secret} /></div>}
            </section>

            <section className='mt-6'>
                <h2 className='text-lg font-semibold text-zinc-900'>Your endpoints</h2>
                {isLoading ? (
                    <p className='mt-4 text-sm text-zinc-500'>Loading…</p>
                ) : !endpoints?.length ? (
                    <div className='mt-4 flex items-center gap-3 rounded-2xl border-2 border-dashed border-zinc-300 bg-white/60 p-6 text-sm text-zinc-500'>
                        <Webhook className='h-5 w-5' /> No endpoints yet.
                    </div>
                ) : (
                    <Stagger onMount as='ul' className='mt-4 space-y-3' gap={0.06}>
                        {endpoints.map((w) => {
                            const failing = w.active && w.failureCount > 0;
                            return (
                                <StaggerItem as='li' key={w.id} className='rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-950/5'>
                                    <div className='flex flex-wrap items-center gap-2'>
                                        <code className='min-w-0 flex-1 truncate text-sm font-medium text-zinc-900'>{w.url}</code>
                                        <span
                                            className={cn(
                                                'rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                                                !w.active ? 'bg-zinc-100 text-zinc-600 ring-zinc-500/20' : failing ? 'bg-amber-50 text-amber-700 ring-amber-600/20' : 'bg-green-50 text-green-700 ring-green-600/20'
                                            )}>
                                            {!w.active ? 'Paused' : failing ? 'Failing' : 'Active'}
                                        </span>
                                    </div>
                                    <p className='mt-1 text-xs text-zinc-500'>
                                        {w.events.join(', ')} ·{' '}
                                        {w.lastAttemptAt
                                            ? `last delivery ${formatDistanceToNow(new Date(w.lastAttemptAt), { addSuffix: true })}${w.lastStatus ? ` (${w.lastStatus})` : ''}`
                                            : 'no deliveries yet'}
                                    </p>
                                    {w.lastError && <p className='mt-1 text-xs text-red-600'>{w.lastError}</p>}
                                    {!w.active && w.failureCount >= 10 && (
                                        <p className='mt-1 text-xs text-amber-700'>Paused automatically after repeated failures. Resume it once your endpoint is fixed.</p>
                                    )}
                                    <div className='mt-3 flex items-center gap-1 border-t border-zinc-100 pt-3'>
                                        <Button size='sm' variant='ghost' disabled={testingId === w.id} onClick={() => sendTest(w.id)} className='text-zinc-600'>
                                            {testingId === w.id ? <Loader2 className='mr-1.5 h-4 w-4 animate-spin' /> : <Send className='mr-1.5 h-4 w-4' />} Send test
                                        </Button>
                                        <Button size='sm' variant='ghost' onClick={() => setActive({ id: w.id, active: !w.active })} className='text-zinc-600'>
                                            {w.active ? <Pause className='mr-1.5 h-4 w-4' /> : <Play className='mr-1.5 h-4 w-4' />} {w.active ? 'Pause' : 'Resume'}
                                        </Button>
                                        <Button size='sm' variant='ghost' onClick={() => remove({ id: w.id })} className='ml-auto text-zinc-400 hover:bg-red-50 hover:text-red-600'>
                                            <Trash className='h-4 w-4' />
                                        </Button>
                                    </div>
                                </StaggerItem>
                            );
                        })}
                    </Stagger>
                )}
            </section>

            <section className='mt-10'>
                <h2 className='text-lg font-semibold text-zinc-900'>Verifying signatures</h2>
                <p className='mt-1 text-sm text-zinc-500'>
                    Every request carries an <code className='rounded bg-zinc-100 px-1'>Otterly-Signature</code> header. Compute the HMAC of the raw body with your secret and compare. Failed deliveries are retried twice, 2 and 8 seconds later.
                </p>
                <pre className='mt-4 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-xs leading-relaxed text-zinc-100 sm:text-sm'>{VERIFY_SNIPPET}</pre>
                <p className='mt-4 text-sm font-medium text-zinc-700'>Example payload</p>
                <pre className='mt-2 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-xs leading-relaxed text-zinc-100 sm:text-sm'>{`{
  "id": "evt_9f2c1a7b3d4e5f60",
  "type": "document.ready",
  "createdAt": "2026-10-20T10:15:00.000Z",
  "data": { "document": { "id": "…", "name": "Contract.pdf", "status": "SUCCESS", "pages": 12, "usedOcr": false } }
}`}</pre>
            </section>
        </main>
    );
}

export default Webhooks;
