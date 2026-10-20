'use client';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { AlertTriangle, ArrowRight, FileText, KeyRound, MessageSquare, Sparkles, UploadCloud } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import UploadButton from '@/components/upload-button';
import BillingButton from '@/components/billing-button';
import { nextPlan } from '@/config/plans';
import { cn } from '@/lib/utils';

const tileClass =
    'group flex w-full items-start gap-4 rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-zinc-950/5 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-green-500/40';

function Tile({ icon: Icon, title, hint }: { icon: typeof FileText; title: string; hint: string }) {
    return (
        <>
            <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-sm'>
                <Icon className='h-5 w-5' />
            </span>
            <span className='min-w-0'>
                <span className='block font-medium text-zinc-900'>{title}</span>
                <span className='block truncate text-sm text-zinc-500'>{hint}</span>
            </span>
            <ArrowRight className='ml-auto h-4 w-4 shrink-0 self-center text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-green-600' />
        </>
    );
}

export function QuickActions() {
    const { data: files } = trpc.getUserFiles.useQuery();
    const lastReady = [...(files ?? [])]
        .filter((f) => f.uploadStatus === 'SUCCESS')
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];

    return (
        <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
            <UploadButton
                trigger={
                    <button className={tileClass}>
                        <Tile icon={UploadCloud} title='Upload a PDF' hint='Drag and drop, up to 4MB' />
                    </button>
                }
            />
            {lastReady ? (
                <Link href={`/dashboard/${lastReady.id}`} className={tileClass}>
                    <Tile icon={MessageSquare} title='Continue chatting' hint={lastReady.name} />
                </Link>
            ) : (
                <div className={cn(tileClass, 'cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-sm hover:ring-zinc-950/5')}>
                    <Tile icon={MessageSquare} title='Continue chatting' hint='Upload a document first' />
                </div>
            )}
            <Link href='/documents' className={tileClass}>
                <Tile icon={FileText} title='Browse documents' hint={`${files?.length ?? 0} in your library`} />
            </Link>
            <Link href='/developers' className={tileClass}>
                <Tile icon={KeyRound} title='Create API key' hint='Use your documents from code' />
            </Link>
        </div>
    );
}

export function TokenChart() {
    const { data, isLoading } = trpc.getDailyTokens.useQuery();
    const max = Math.max(1, ...(data ?? []).map((d) => d.tokens));
    const total = (data ?? []).reduce((sum, d) => sum + d.tokens, 0);

    return (
        <section className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-950/5 lg:col-span-2'>
            <div className='flex items-baseline justify-between'>
                <h2 className='font-semibold text-zinc-900'>Token usage</h2>
                <span className='text-sm text-zinc-500'>Last 7 days · {total.toLocaleString()} tokens</span>
            </div>
            <div className='relative mt-6 h-44'>
                <div className='absolute inset-x-0 top-0 flex h-[calc(100%-1.5rem)] flex-col justify-between'>
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className='border-t border-dashed border-zinc-200' />
                    ))}
                </div>
                <div className='relative flex h-full items-end gap-3'>
                    {(data ?? Array.from({ length: 7 }, () => null)).map((d, i) => (
                        <div key={d?.date ?? i} className='group flex h-full flex-1 flex-col items-center justify-end gap-2'>
                            <div className='relative flex w-full flex-1 items-end'>
                                {d && (
                                    <span className='pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100'>
                                        {d.tokens.toLocaleString()}
                                    </span>
                                )}
                                <div
                                    className={cn(
                                        'w-full rounded-t-lg transition-all duration-500',
                                        isLoading
                                            ? 'animate-pulse bg-zinc-100'
                                            : d?.tokens
                                              ? 'bg-gradient-to-t from-green-700 to-green-400'
                                              : 'bg-zinc-100'
                                    )}
                                    style={{ height: `${d ? Math.max(3, (d.tokens / max) * 100) : 30}%` }}
                                />
                            </div>
                            <span className='h-4 text-xs text-zinc-500'>{d ? format(new Date(d.date), 'EEE') : ''}</span>
                        </div>
                    ))}
                </div>
            </div>
            {!isLoading && total === 0 && (
                <p className='mt-4 text-sm text-zinc-500'>No usage yet. Ask a question in one of your documents.</p>
            )}
        </section>
    );
}

export function PlanCard() {
    const { data } = trpc.getUsage.useQuery();
    const next = data ? nextPlan(data.plan.slug) : undefined;
    const target = next ?? data?.plan;

    return (
        <section className='rounded-2xl bg-gradient-to-br from-green-50 to-white p-5 shadow-sm ring-1 ring-green-600/15'>
            <div className='flex items-center gap-2 text-green-700'>
                <Sparkles className='h-4 w-4' />
                <h2 className='font-semibold'>{next ? `Upgrade to ${next.name}` : `You're on ${data?.plan.name ?? '…'}`}</h2>
            </div>
            {target && (
                <ul className='mt-4 space-y-2 text-sm text-zinc-700'>
                    <li>{target.tokensPerMonth.toLocaleString()} tokens every month</li>
                    <li>Up to {target.maxDocuments} documents</li>
                    <li>{target.price ? `$${target.price}/month, cancel anytime` : 'Free forever'}</li>
                </ul>
            )}
            {next ? (
                <BillingButton action='checkout' plan={next.slug as 'pro' | 'business'} className='mt-5 w-full'>
                    Upgrade to {next.name}
                </BillingButton>
            ) : (
                data && data.plan.slug !== 'free' && (
                    <BillingButton action='portal' variant='outline' className='mt-5 w-full'>
                        Manage billing
                    </BillingButton>
                )
            )}
        </section>
    );
}

export function ApiCard() {
    const { data } = trpc.getApiSummary.useQuery();

    return (
        <section className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-950/5'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2 text-zinc-500'>
                    <KeyRound className='h-4 w-4' />
                    <h2 className='text-sm'>API</h2>
                </div>
                <Link href='/developers' className='text-sm font-medium text-green-700 hover:underline'>
                    Manage
                </Link>
            </div>
            <dl className='mt-3 grid grid-cols-2 gap-3'>
                <div>
                    <dt className='text-xs text-zinc-500'>Active keys</dt>
                    <dd className='text-2xl font-semibold text-zinc-900'>{data?.activeKeys ?? '–'}</dd>
                </div>
                <div>
                    <dt className='text-xs text-zinc-500'>Requests</dt>
                    <dd className='text-2xl font-semibold text-zinc-900'>{data?.totalRequests.toLocaleString() ?? '–'}</dd>
                </div>
            </dl>
            <p className='mt-3 text-xs text-zinc-500'>
                {data?.lastUsedAt ? `Last used ${formatDistanceToNow(new Date(data.lastUsedAt), { addSuffix: true })}` : 'No API calls yet'}
            </p>
        </section>
    );
}

const ACTIVITY_ICONS = { upload: UploadCloud, question: MessageSquare, 'api-key': KeyRound };

export function ActivityFeed() {
    const { data, isLoading } = trpc.getActivity.useQuery();

    return (
        <section className='mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-950/5'>
            <h2 className='font-semibold text-zinc-900'>Recent activity</h2>
            {isLoading ? (
                <p className='mt-4 text-sm text-zinc-500'>Loading…</p>
            ) : !data?.length ? (
                <p className='mt-4 text-sm text-zinc-500'>Nothing yet. Upload a PDF to get started.</p>
            ) : (
                <ul className='mt-4 divide-y divide-zinc-100'>
                    {data.map((item) => {
                        const Icon = ACTIVITY_ICONS[item.type];
                        return (
                            <li key={item.id} className='flex items-center gap-3 py-3'>
                                <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600'>
                                    <Icon className='h-4 w-4' />
                                </span>
                                <span className='min-w-0 flex-1 truncate text-sm text-zinc-800'>{item.label}</span>
                                <span className='shrink-0 text-xs text-zinc-500'>
                                    {formatDistanceToNow(new Date(item.at), { addSuffix: true })}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

export function Alerts() {
    const { data: usage } = trpc.getUsage.useQuery();
    const { data: files } = trpc.getUserFiles.useQuery();

    const alerts: { key: string; tone: 'red' | 'amber'; text: string; href?: string; cta?: string }[] = [];
    if (usage) {
        const pct = (usage.tokensUsed / usage.tokenLimit) * 100;
        if (pct >= 100) alerts.push({ key: 'tok', tone: 'red', text: 'You\'ve used all your tokens for this period. Chat is paused until it renews.' });
        else if (pct >= 80) alerts.push({ key: 'tok', tone: 'amber', text: `You've used ${Math.round(pct)}% of your tokens this period.` });
        if (usage.documentsUsed >= usage.documentLimit)
            alerts.push({ key: 'docs', tone: 'amber', text: `You've reached your ${usage.documentLimit}-document limit. Delete a document to upload another.`, href: '/documents', cta: 'Manage documents' });
        if (usage.daysLeft <= 7)
            alerts.push({ key: 'days', tone: 'amber', text: `Your ${usage.plan.name} period ends in ${usage.daysLeft} day${usage.daysLeft === 1 ? '' : 's'}.` });
    }
    const failed = files?.filter((f) => f.uploadStatus === 'FAILED').length ?? 0;
    if (failed)
        alerts.push({ key: 'failed', tone: 'red', text: `${failed} document${failed === 1 ? '' : 's'} failed to process. Delete and upload again.`, href: '/documents', cta: 'View documents' });

    if (!alerts.length) return null;

    return (
        <div className='mt-8 space-y-3'>
            {alerts.map((a) => (
                <div
                    key={a.key}
                    role='alert'
                    className={cn(
                        'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm',
                        a.tone === 'red' ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-900'
                    )}>
                    <AlertTriangle className='h-4 w-4 shrink-0' />
                    <span className='flex-1'>{a.text}</span>
                    {a.href && (
                        <Link href={a.href} className='shrink-0 font-medium underline'>
                            {a.cta}
                        </Link>
                    )}
                </div>
            ))}
        </div>
    );
}
