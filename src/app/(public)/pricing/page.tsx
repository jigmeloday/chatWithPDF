import { getSessionUser } from '@/lib/auth';
import { getUsageSummary } from '@/lib/usage';
import PlanCards from '@/components/plan-cards';

export const metadata = { title: 'Pricing · Otterly' };

async function Page() {
    const user = await getSessionUser();
    const current = user ? (await getUsageSummary(user.id)).plan.slug : null;

    return (
        <main className='mx-auto max-w-6xl px-4 py-16 md:py-20'>
            <div className='mb-12 text-center'>
                <p className='text-sm font-medium text-green-700'>Pricing</p>
                <h1 className='mt-2 text-4xl font-bold tracking-tight md:text-5xl'>Simple plans, no surprises</h1>
                <p className='mx-auto mt-3 max-w-xl text-zinc-500'>
                    Start free. Upgrade when you need more documents and more questions. Cancel any time.
                </p>
            </div>
            <PlanCards current={current} />
        </main>
    );
}

export default Page;
