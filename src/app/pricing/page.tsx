import Link from 'next/link';
import { Check } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import { getUsageSummary } from '@/lib/usage';
import { PLANS } from '@/config/plans';
import { buttonVariants } from '@/components/ui/button';
import BillingButton from '@/components/billing-button';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Pricing · DocuChatty' };

async function Page() {
    const user = await getSessionUser();
    const current = user ? (await getUsageSummary(user.id)).plan.slug : null;

    return (
        <main className='mx-auto max-w-5xl px-4 py-16 md:py-20'>
            <div className='text-center'>
                <p className='text-sm font-medium text-green-700'>Pricing</p>
                <h1 className='mt-2 text-4xl font-bold tracking-tight md:text-5xl'>Simple plans, no surprises</h1>
                <p className='mx-auto mt-3 max-w-xl text-zinc-500'>
                    Start free. Upgrade when you need more documents and more questions. Cancel any time.
                </p>
            </div>

            <div className='mt-12 grid gap-6 md:grid-cols-2'>
                {Object.values(PLANS).map((plan) => {
                    const isPro = plan.slug === 'pro';
                    return (
                        <section
                            key={plan.slug}
                            className={cn(
                                'relative rounded-3xl bg-white p-8 shadow-sm ring-1',
                                isPro ? 'ring-2 ring-green-600 shadow-lg' : 'ring-zinc-950/10'
                            )}>
                            {isPro && (
                                <span className='absolute -top-3 left-8 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white'>
                                    Most popular
                                </span>
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
                                {current === plan.slug ? (
                                    <span className={cn(buttonVariants({ variant: 'outline' }), 'w-full cursor-default')}>Your current plan</span>
                                ) : isPro && current === 'free' ? (
                                    <BillingButton action='checkout' className='w-full'>Upgrade to Pro</BillingButton>
                                ) : !user ? (
                                    <Link href='/sign-up' className={cn(buttonVariants({ variant: isPro ? 'default' : 'outline' }), 'w-full')}>
                                        {isPro ? 'Get started with Pro' : 'Start for free'}
                                    </Link>
                                ) : (
                                    <Link href='/settings' className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>Manage in settings</Link>
                                )}
                            </div>
                        </section>
                    );
                })}
            </div>
        </main>
    );
}

export default Page;
