'use client';
import { format } from 'date-fns';
import { Code2, FileText, MessageSquare, Zap } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import { EASE, CountUp, GrowBar, Stagger, StaggerItem } from '@/components/motion';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const fmt = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 10_000 ? `${Math.round(n / 1000)}K` : n.toLocaleString());

function Tile({ icon: Icon, label, value, hint, tone }: { icon: typeof Zap; label: string; value: number; hint: string; tone: string }) {
    return (
        <StaggerItem className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-950/5'>
            <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-zinc-500'>{label}</span>
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', tone)}>
                    <Icon className='h-[18px] w-[18px]' />
                </span>
            </div>
            <p className='mt-3 text-3xl font-semibold tracking-tight text-zinc-900'>
                <CountUp value={value} format={fmt} />
            </p>
            <p className='mt-1 text-xs text-zinc-500'>{hint}</p>
        </StaggerItem>
    );
}

function UsageAnalytics() {
    const { data, isLoading } = trpc.getUsageBreakdown.useQuery();

    const maxDay = Math.max(1, ...(data?.daily ?? []).map((d) => d.app + d.api));
    const maxDoc = Math.max(1, ...(data?.byDocument ?? []).map((d) => d.tokens));
    const total30 = (data?.daily ?? []).reduce((s, d) => s + d.app + d.api, 0);
    const split = data ? data.app.tokens + data.api.tokens : 0;

    return (
        <main className='mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8'>
            <p className='text-sm font-medium text-green-700'>Insights</p>
            <h1 className='mt-1 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl'>Usage</h1>
            <p className='mt-1 text-zinc-500'>Where your tokens go, across the app and the API.</p>

            {isLoading || !data ? (
                <p className='mt-10 text-center text-zinc-500'>Loading…</p>
            ) : (
                <>
                    <Stagger onMount className='mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4'>
                        <Tile icon={Zap} label='Tokens this period' value={data.tokensUsed} hint={`of ${fmt(data.tokenLimit)} on your plan`} tone='bg-violet-50 text-violet-700' />
                        <Tile icon={MessageSquare} label='Questions in the app' value={data.app.questions} hint={`${fmt(data.app.tokens)} tokens`} tone='bg-green-50 text-green-700' />
                        <Tile icon={Code2} label='Questions via API' value={data.api.questions} hint={`${fmt(data.api.tokens)} tokens`} tone='bg-sky-50 text-sky-700' />
                        <Tile icon={FileText} label='API requests, all time' value={data.apiRequests} hint='across all your keys' tone='bg-amber-50 text-amber-700' />
                    </Stagger>

                    <div className='mt-6 grid gap-4 lg:grid-cols-3'>
                        <section className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-950/5 lg:col-span-2'>
                            <div className='flex flex-wrap items-baseline justify-between gap-2'>
                                <h2 className='font-semibold text-zinc-900'>Tokens per day</h2>
                                <span className='text-sm text-zinc-500'>Last 30 days · {total30.toLocaleString()} tokens</span>
                            </div>
                            <div className='mt-3 flex gap-4 text-xs text-zinc-500'>
                                <span className='flex items-center gap-1.5'><span className='h-2.5 w-2.5 rounded-sm bg-green-600' /> App</span>
                                <span className='flex items-center gap-1.5'><span className='h-2.5 w-2.5 rounded-sm bg-violet-500' /> API</span>
                            </div>
                            <div className='relative mt-4 h-48'>
                                <div className='absolute inset-x-0 top-0 flex h-[calc(100%-1.25rem)] flex-col justify-between'>
                                    {[0, 1, 2, 3].map((i) => (
                                        <div key={i} className='border-t border-dashed border-zinc-200' />
                                    ))}
                                </div>
                                <div className='relative flex h-full items-end gap-[3px]'>
                                    {data.daily.map((d, i) => (
                                        <div key={d.date} className='group flex h-full flex-1 flex-col items-center justify-end gap-1'>
                                            <div className='relative flex w-full flex-1 flex-col justify-end'>
                                                <span className='pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100'>
                                                    {format(new Date(d.date), 'MMM d')}: {(d.app + d.api).toLocaleString()}
                                                </span>
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${((d.app + d.api) / maxDay) * 100}%` }}
                                                    transition={{ duration: 0.7, ease: EASE, delay: i * 0.015 }}
                                                    className='flex w-full flex-col overflow-hidden rounded-t'
                                                    style={{ minHeight: d.app + d.api ? 3 : 0 }}>
                                                    <div className='bg-violet-500' style={{ flexGrow: d.api }} />
                                                    <div className='bg-green-600' style={{ flexGrow: d.app }} />
                                                </motion.div>
                                            </div>
                                            <span className='h-4 text-[10px] text-zinc-400'>{i % 5 === 0 ? format(new Date(d.date), 'd') : ''}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {total30 === 0 && <p className='mt-3 text-sm text-zinc-500'>No usage yet. Ask a question to see it here.</p>}
                        </section>

                        <section className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-950/5'>
                            <h2 className='font-semibold text-zinc-900'>App vs API</h2>
                            <p className='text-sm text-zinc-500'>Share of tokens this period</p>
                            <div className='mt-5 flex h-4 overflow-hidden rounded-full bg-zinc-100'>
                                <GrowBar percent={split ? (data.app.tokens / split) * 100 : 0} className='h-full bg-green-600' />
                                <GrowBar percent={split ? (data.api.tokens / split) * 100 : 0} className='h-full bg-violet-500' delay={0.1} />
                            </div>
                            <dl className='mt-4 space-y-2 text-sm'>
                                <div className='flex justify-between'><dt className='flex items-center gap-2 text-zinc-600'><span className='h-2.5 w-2.5 rounded-sm bg-green-600' />App</dt><dd className='font-medium'>{data.app.tokens.toLocaleString()}</dd></div>
                                <div className='flex justify-between'><dt className='flex items-center gap-2 text-zinc-600'><span className='h-2.5 w-2.5 rounded-sm bg-violet-500' />API</dt><dd className='font-medium'>{data.api.tokens.toLocaleString()}</dd></div>
                            </dl>
                        </section>
                    </div>

                    <section className='mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-950/5'>
                        <h2 className='font-semibold text-zinc-900'>Top documents</h2>
                        <p className='text-sm text-zinc-500'>Tokens used per document this period</p>
                        {!data.byDocument.length ? (
                            <p className='mt-4 text-sm text-zinc-500'>Nothing yet.</p>
                        ) : (
                            <ul className='mt-4 space-y-3'>
                                {data.byDocument.map((d, i) => (
                                    <li key={d.name + i}>
                                        <div className='flex justify-between text-sm'>
                                            <span className='truncate pr-4 text-zinc-700'>{d.name}</span>
                                            <span className='shrink-0 font-medium text-zinc-900'>{d.tokens.toLocaleString()}</span>
                                        </div>
                                        <div className='mt-1 h-2 overflow-hidden rounded-full bg-zinc-100'>
                                            <GrowBar percent={(d.tokens / maxDoc) * 100} delay={i * 0.05} className='h-full rounded-full bg-gradient-to-r from-green-600 to-emerald-400' />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}

export default UsageAnalytics;
