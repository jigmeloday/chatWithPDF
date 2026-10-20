'use client';
import { ArrowUpRight, CalendarClock, Sparkles } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import UploadButton from '@/components/upload-button';
import { Button } from '@/components/ui/button';
import UsageCards from '@/components/dashboard/usage-cards';
import { ActivityFeed, Alerts, ApiCard, PlanCard, QuickActions, TokenChart } from '@/components/dashboard/tools';

function greeting() {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function Overview({ name }: { name: string }) {
    const { data: usage } = trpc.getUsage.useQuery();
    const first = name ? name.split(' ')[0] : '';

    return (
        <main className='mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8'>
            <section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-900 px-6 py-8 text-white shadow-lg md:px-10 md:py-10'>
                <div className='pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl' />
                <div className='pointer-events-none absolute -bottom-24 right-40 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl' />
                <div className='relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
                    <div>
                        <div className='flex flex-wrap items-center gap-2 text-xs font-medium'>
                            {usage && (
                                <>
                                    <span className='inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20'>
                                        <Sparkles className='h-3.5 w-3.5' /> {usage.plan.name} plan
                                    </span>
                                    <span className='inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20'>
                                        <CalendarClock className='h-3.5 w-3.5' /> {usage.daysLeft} days left
                                    </span>
                                </>
                            )}
                        </div>
                        <h1 className='mt-4 text-3xl font-bold tracking-tight md:text-4xl'>
                            {greeting()}{first ? `, ${first}` : ''}
                        </h1>
                        <p className='mt-2 max-w-xl text-green-50/90'>
                            Chat with your documents, track your usage and manage API access, all in one place.
                        </p>
                    </div>
                    <UploadButton
                        trigger={
                            <Button size='lg' className='bg-white text-green-800 shadow-md hover:bg-green-50'>
                                Upload a PDF <ArrowUpRight className='ml-1.5 h-4 w-4' />
                            </Button>
                        }
                    />
                </div>
            </section>

            <Alerts />

            <UsageCards />

            <QuickActions />

            <div className='mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3'>
                <TokenChart />
                <div className='flex flex-col gap-4'>
                    <PlanCard />
                    <ApiCard />
                </div>
            </div>

            <ActivityFeed />
        </main>
    );
}

export default Overview;
