'use client';
import { format } from 'date-fns';
import { CalendarClock, FileText, MessageSquare, Zap } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import Skeleton from '@/components/skeleton';
import { cn } from '@/lib/utils';

const formatNumber = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 10_000 ? `${Math.round(n / 1000)}K` : n.toLocaleString();

const barColor = (pct: number) => (pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-600');

function Meter({ used, limit }: { used: number; limit: number }) {
    const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
    return (
        <div
            role='progressbar'
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            className='mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100'>
            <div className={cn('h-full rounded-full transition-all duration-700', barColor(pct))} style={{ width: `${pct}%` }} />
        </div>
    );
}

const TONES = {
    green: 'bg-green-50 text-green-700',
    violet: 'bg-violet-50 text-violet-700',
    sky: 'bg-sky-50 text-sky-700',
    amber: 'bg-amber-50 text-amber-700',
};

function Card({
    icon: Icon,
    label,
    tone,
    children,
}: {
    icon: typeof Zap;
    label: string;
    tone: keyof typeof TONES;
    children: React.ReactNode;
}) {
    return (
        <div className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-950/5 transition hover:-translate-y-0.5 hover:shadow-md'>
            <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-zinc-500'>{label}</span>
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', TONES[tone])}>
                    <Icon className='h-[18px] w-[18px]' />
                </span>
            </div>
            {children}
        </div>
    );
}

function UsageCards() {
    const { data, isLoading } = trpc.getUsage.useQuery();

    if (isLoading || !data) {
        return (
            <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className='space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-950/5'>
                        <Skeleton className='w-1/2' />
                        <Skeleton className='h-8 w-2/3' />
                        <Skeleton />
                    </div>
                ))}
            </div>
        );
    }

    const tokensLeft = Math.max(0, data.tokenLimit - data.tokensUsed);
    const periodLen = Math.max(1, (+new Date(data.periodEnd) - +new Date(data.periodStart)) / 86_400_000);
    const elapsed = Math.min(100, ((periodLen - data.daysLeft) / periodLen) * 100);

    return (
        <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Card icon={CalendarClock} label='Subscription' tone='green'>
                <p className='mt-3 text-3xl font-semibold tracking-tight text-zinc-900'>
                    {data.daysLeft} <span className='text-base font-normal text-zinc-500'>days left</span>
                </p>
                <div className='mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100'>
                    <div className='h-full rounded-full bg-green-600 transition-all duration-700' style={{ width: `${elapsed}%` }} />
                </div>
                <p className='mt-2 text-xs text-zinc-500'>
                    {data.plan.name} · renews {format(new Date(data.periodEnd), 'MMM d, yyyy')}
                </p>
            </Card>

            <Card icon={Zap} label='Tokens used' tone='violet'>
                <p className='mt-3 text-3xl font-semibold tracking-tight text-zinc-900'>
                    {formatNumber(data.tokensUsed)}
                    <span className='text-base font-normal text-zinc-500'> / {formatNumber(data.tokenLimit)}</span>
                </p>
                <Meter used={data.tokensUsed} limit={data.tokenLimit} />
                <p className='mt-2 text-xs text-zinc-500'>{formatNumber(tokensLeft)} tokens left this period</p>
            </Card>

            <Card icon={FileText} label='Documents' tone='sky'>
                <p className='mt-3 text-3xl font-semibold tracking-tight text-zinc-900'>
                    {data.documentsUsed}
                    <span className='text-base font-normal text-zinc-500'> / {data.documentLimit}</span>
                </p>
                <Meter used={data.documentsUsed} limit={data.documentLimit} />
                <p className='mt-2 text-xs text-zinc-500'>
                    {Math.max(0, data.documentLimit - data.documentsUsed)} uploads remaining
                </p>
            </Card>

            <Card icon={MessageSquare} label='Messages this period' tone='amber'>
                <p className='mt-3 text-3xl font-semibold tracking-tight text-zinc-900'>
                    {data.messagesSent.toLocaleString()}
                </p>
                <p className='mt-4 text-xs text-zinc-500'>Questions you&apos;ve asked your documents</p>
            </Card>
        </div>
    );
}

export default UsageCards;
