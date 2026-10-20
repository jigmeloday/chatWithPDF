import { format } from 'date-fns';
import { CalendarClock, Mail, Receipt, ShieldCheck } from 'lucide-react';
import { Suspense } from 'react';
import PlanCards from '@/components/plan-cards';
import UpgradedToast from '@/components/billing/upgraded-toast';
import BillingButton from '@/components/billing-button';
import { GrowBar, Reveal } from '@/components/motion';
import { SUPPORT_EMAIL } from '@/config/site';
import type { UsageSummary } from '@/lib/usage';
import { cn } from '@/lib/utils';

const fmt = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 10_000 ? `${Math.round(n / 1000)}K` : n.toLocaleString());
const barColor = (pct: number) => (pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-300' : 'bg-white');

function Meter({ label, used, limit, format: f = fmt }: { label: string; used: number; limit: number; format?: (n: number) => string }) {
    const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
    return (
        <div>
            <div className='flex justify-between text-sm'>
                <span className='text-green-100'>{label}</span>
                <span className='font-medium'>{f(used)} / {f(limit)}</span>
            </div>
            <div className='mt-2 h-2 overflow-hidden rounded-full bg-white/20'>
                <GrowBar percent={pct} delay={0.2} className={cn('h-full rounded-full', barColor(pct))} />
            </div>
        </div>
    );
}

const NOTES = [
    { icon: Receipt, title: 'Invoices and payment method', text: 'Open "Manage billing" to download invoices, update your card or cancel.' },
    { icon: CalendarClock, title: 'Cancel any time', text: 'You keep your paid plan until the end of the period you already paid for.' },
    { icon: ShieldCheck, title: 'Secure payments', text: 'Payments are handled by Stripe. We never see or store your card details.' },
];

function BillingView({ usage }: { usage: UsageSummary }) {
    const paid = usage.plan.slug !== 'free';

    return (
        <main className='mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8'>
            <Suspense>
                <UpgradedToast />
            </Suspense>
            <p className='text-sm font-medium text-green-700'>Account</p>
            <h1 className='mt-1 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl'>Billing</h1>
            <p className='mt-1 text-zinc-500'>Your plan, what you&apos;ve used and your options to change it.</p>

            <Reveal>
                <section className='relative mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-900 p-6 text-white shadow-lg md:p-8'>
                    <div className='pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl' />
                    <div className='relative grid gap-8 md:grid-cols-2'>
                        <div>
                            <p className='text-sm text-green-100'>Current plan</p>
                            <p className='mt-1 text-4xl font-bold tracking-tight'>{usage.plan.name}</p>
                            <p className='mt-1 text-green-100'>
                                {usage.plan.price ? `$${usage.plan.price} / month` : 'Free forever'}
                            </p>
                            <p className='mt-5 flex items-center gap-2 text-sm text-green-50'>
                                <CalendarClock className='h-4 w-4' />
                                {paid ? 'Renews' : 'Usage resets'} on {format(new Date(usage.periodEnd), 'MMMM d, yyyy')} · {usage.daysLeft} days left
                            </p>
                            {paid && (
                                <BillingButton action='portal' className='mt-6 bg-white text-green-800 hover:bg-green-50'>
                                    Manage billing
                                </BillingButton>
                            )}
                        </div>
                        <div className='space-y-5'>
                            <Meter label='Tokens' used={usage.tokensUsed} limit={usage.tokenLimit} />
                            <Meter label='Documents' used={usage.documentsUsed} limit={usage.documentLimit} format={(n) => String(n)} />
                        </div>
                    </div>
                </section>
            </Reveal>

            <h2 className='mt-12 text-xl font-semibold text-zinc-900'>{paid ? 'Change your plan' : 'Upgrade your plan'}</h2>
            <div className='mt-5 pt-3'>
                <PlanCards current={usage.plan.slug} />
            </div>

            <Reveal>
                <div className='mt-12 grid gap-4 md:grid-cols-3'>
                    {NOTES.map(({ icon: Icon, title, text }) => (
                        <div key={title} className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-950/5'>
                            <span className='flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700'>
                                <Icon className='h-[18px] w-[18px]' />
                            </span>
                            <h3 className='mt-3 font-semibold text-zinc-900'>{title}</h3>
                            <p className='mt-1 text-sm text-zinc-600'>{text}</p>
                        </div>
                    ))}
                </div>
                <p className='mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500'>
                    <Mail className='h-4 w-4' /> Billing question? Email{' '}
                    <a href={`mailto:${SUPPORT_EMAIL}`} className='font-medium text-green-700 hover:underline'>{SUPPORT_EMAIL}</a>
                </p>
            </Reveal>
        </main>
    );
}

export default BillingView;
