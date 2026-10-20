'use client';
import { FormEvent, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Check, Copy, KeyRound, Loader2, Trash } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ENDPOINTS = [
    { method: 'GET', path: '/api/v1/documents', desc: 'List your documents and their processing status.' },
    { method: 'GET', path: '/api/v1/usage', desc: 'Tokens, documents and days left in the current period.' },
    { method: 'POST', path: '/api/v1/documents', desc: 'Upload a PDF (multipart form, field "file"). Poll the list until it is SUCCESS.' },
    { method: 'POST', path: '/api/v1/chat', desc: 'Ask a question about a document and get an answer with token usage.' },
];

function NewKeyBanner({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className='rounded-xl border border-green-200 bg-green-50 p-4'>
            <p className='text-sm font-medium text-green-900'>
                Copy your new key now. You won&apos;t be able to see it again.
            </p>
            <div className='mt-3 flex items-center gap-2'>
                <code className='flex-1 truncate rounded-md bg-white px-3 py-2 text-sm'>{value}</code>
                <Button size='sm' variant='outline' onClick={copy} aria-label='Copy key'>
                    {copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
                </Button>
            </div>
        </div>
    );
}

function Developers() {
    const [name, setName] = useState('');
    const [newKey, setNewKey] = useState<string | null>(null);
    const [baseUrl, setBaseUrl] = useState('https://your-domain.com');
    useEffect(() => setBaseUrl(window.location.origin), []);
    const utils = trpc.useContext();
    const { data: keys, isLoading } = trpc.listApiKeys.useQuery();

    const { mutate: createKey, isLoading: creating, error } = trpc.createApiKey.useMutation({
        onSuccess: ({ key }) => {
            setNewKey(key);
            setName('');
            utils.listApiKeys.invalidate();
        },
    });
    const { mutate: revokeKey, variables, isLoading: revoking } = trpc.revokeApiKey.useMutation({
        onSuccess: () => utils.listApiKeys.invalidate(),
    });

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        setNewKey(null);
        createKey({ name });
    };

    return (
        <main className='mx-auto max-w-4xl px-4 py-8 md:px-10 md:py-12'>
            <p className='text-sm font-medium text-green-700'>Developers</p>
            <h1 className='mt-1 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl'>API access</h1>
            <p className='mt-1 text-zinc-500'>
                Use your documents from your own apps. API calls count against the same token and document limits as your plan.
            </p>

            <section className='mt-8'>
                <h2 className='text-xl font-semibold text-zinc-900'>API keys</h2>
                <form onSubmit={onSubmit} className='mt-4 flex gap-2'>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder='Key name, e.g. Production'
                        maxLength={60}
                        className='h-10 max-w-xs'
                        required
                    />
                    <Button type='submit' disabled={creating}>
                        {creating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Create key
                    </Button>
                </form>
                {error && <p className='mt-2 text-sm text-red-600'>{error.message}</p>}
                {newKey && <div className='mt-4'><NewKeyBanner value={newKey} /></div>}

                <ul className='mt-4 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white shadow-sm'>
                    {isLoading ? (
                        <li className='p-5 text-sm text-zinc-500'>Loading…</li>
                    ) : !keys?.length ? (
                        <li className='flex items-center gap-3 p-5 text-sm text-zinc-500'>
                            <KeyRound className='h-4 w-4' /> No API keys yet.
                        </li>
                    ) : (
                        keys.map((k) => (
                            <li key={k.id} className='flex items-center justify-between gap-4 p-4'>
                                <div className='min-w-0'>
                                    <p className='truncate font-medium text-zinc-900'>{k.name}</p>
                                    <p className='text-xs text-zinc-500'>
                                        <code>{k.prefix}…</code> · created {format(new Date(k.createdAt), 'MMM d, yyyy')} ·{' '}
                                        {k.lastUsedAt ? `last used ${format(new Date(k.lastUsedAt), 'MMM d, yyyy')}` : 'never used'}
                                    </p>
                                </div>
                                <Button
                                    size='icon'
                                    variant='ghost'
                                    aria-label={`Revoke ${k.name}`}
                                    onClick={() => revokeKey({ id: k.id })}
                                    className='text-zinc-400 hover:bg-red-50 hover:text-red-600'>
                                    {revoking && variables?.id === k.id ? (
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                    ) : (
                                        <Trash className='h-4 w-4' />
                                    )}
                                </Button>
                            </li>
                        ))
                    )}
                </ul>
            </section>

            <section className='mt-10'>
                <h2 className='text-xl font-semibold text-zinc-900'>Quick start</h2>
                <p className='mt-1 text-sm text-zinc-500'>
                    Send your key as a bearer token. Keep it secret and never expose it in client-side code.
                </p>
                <pre className='mt-4 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-100'>
{`curl ${baseUrl}/api/v1/documents \\
  -H "Authorization: Bearer dc_live_..."`}
                </pre>
                <p className='mt-4 text-sm text-zinc-500'>
                    Limit: 60 requests per minute. Full reference:{' '}
                    <a href='/api/v1/openapi.json' target='_blank' rel='noopener noreferrer' className='font-medium text-green-700 hover:underline'>
                        OpenAPI spec
                    </a>
                </p>
                <ul className='mt-6 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white shadow-sm'>
                    {ENDPOINTS.map((e) => (
                        <li key={e.path} className='flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:gap-4'>
                            <span className='flex items-center gap-2'>
                                <span className='w-14 rounded bg-zinc-100 px-2 py-0.5 text-center text-xs font-semibold text-zinc-700'>
                                    {e.method}
                                </span>
                                <code className='text-sm'>{e.path}</code>
                            </span>
                            <span className='text-sm text-zinc-500'>{e.desc}</span>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}

export default Developers;
