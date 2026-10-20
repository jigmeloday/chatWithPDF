import Link from 'next/link';
import { Check } from 'lucide-react';
import { PLANS, PLAN_ORDER, PlanSlug } from '@/config/plans';
import { buttonVariants } from '@/components/ui/button';
import BillingButton from '@/components/billing-button';
import { Stagger, StaggerItem } from '@/components/motion';
import { cn } from '@/lib/utils';

// The three plans side by side. Shared by the public pricing page and the signed-in Billing page.
function PlanCards({ current }: { current: PlanSlug | null }) {
    const currentRank = current ? PLAN_ORDER.indexOf(current) : -1;

    return (
        <Stagger onMount className='grid gap-6 lg:grid-cols-3' gap={0.12}>
            {PLAN_ORDER.map((slug) => {
                const plan = PLANS[slug];
                const isPro = slug === 'pro';
                const rank = PLAN_ORDER.indexOf(slug);

                return (
                    <StaggerItem
                        key={slug}
                        whileHover={{ y: -6 }}
                        className={cn('relative rounded-3xl bg-white p-8 shadow-sm ring-1', isPro ? 'shadow-lg ring-2 ring-green-600' : 'ring-zinc-950/10')}>
                        {isPro && (
                            <span className='absolute -top-3 left-8 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white'>Most popular</span>
                        )}
                        <h2 className='text-xl font-semibold'>{plan.name}</h2>
                        <p className='mt-1 text-sm text-zinc-500'>{plan.tagline}</p>
                        <p className='mt-6'>
                            <span className='text-5xl font-bold tracking-tight'>${plan.price}</span>
                            <span className='text-zinc-500'> / month</span>
                        </p>
                        <ul className='mt-6 space-y-3 text-sm text-zinc-700'>
                            {plan.features.map((f) => (
                                <li key={f} className='flex items-center gap-2'>
                                    <Check className='h-4 w-4 shrink-0 text-green-600' /> {f}
                                </li>
                            ))}
                        </ul>
                        <div className='mt-8'>
                            {current === slug ? (
                                <span className={cn(buttonVariants({ variant: 'outline' }), 'w-full cursor-default')}>Your current plan</span>
                            ) : !current ? (
                                <Link href='/sign-up' className={cn(buttonVariants({ variant: isPro ? 'default' : 'outline' }), 'w-full')}>
                                    {plan.price === 0 ? 'Start for free' : `Get started with ${plan.name}`}
                                </Link>
                            ) : rank > currentRank ? (
                                <BillingButton action='checkout' plan={slug as 'pro' | 'business'} variant={isPro ? 'default' : 'outline'} className='w-full'>
                                    Upgrade to {plan.name}
                                </BillingButton>
                            ) : (
                                <BillingButton action='portal' variant='outline' className='w-full'>
                                    Change plan
                                </BillingButton>
                            )}
                        </div>
                    </StaggerItem>
                );
            })}
        </Stagger>
    );
}

export default PlanCards;
