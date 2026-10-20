'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { NAV_GROUPS, isNavActive } from '@/config/nav';

export function SidebarLinks() {
    const pathname = usePathname();

    return (
        <nav className='flex flex-col gap-5'>
            {NAV_GROUPS.map((group) => (
                <div key={group.title}>
                    <p className='mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400'>{group.title}</p>
                    <div className='flex flex-col gap-0.5'>
                        {group.items.map((item) => {
                            const active = isNavActive(item, pathname);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                        active ? 'text-green-800' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                                    )}>
                                    {active && (
                                        <motion.span
                                            layoutId='sidebar-active'
                                            className='absolute inset-0 rounded-lg bg-green-50'
                                            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                                        />
                                    )}
                                    <Icon className='relative h-4 w-4' />
                                    <span className='relative'>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
}

export function SignOutButton() {
    const router = useRouter();

    const signOut = async () => {
        await authClient.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <button
            onClick={signOut}
            aria-label='Sign out'
            title='Sign out'
            className='rounded-md p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600'>
            <LogOut className='h-4 w-4' />
        </button>
    );
}

export function SidebarUsage() {
    const { data } = trpc.getUsage.useQuery();
    if (!data) return null;

    const pct = Math.min(100, (data.tokensUsed / data.tokenLimit) * 100);
    return (
        <Link
            href={data.plan.slug === 'business' ? '/dashboard' : '/pricing'}
            className='block rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-950/5 transition hover:bg-zinc-100'>
            <div className='flex items-center justify-between text-xs'>
                <span className='font-medium text-zinc-700'>{data.plan.name} plan</span>
                <span className='text-zinc-500'>{data.daysLeft}d left</span>
            </div>
            <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200'>
                <div
                    className={cn('h-full rounded-full', pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-600')}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className='mt-1.5 text-xs text-zinc-500'>
                {Math.round(pct)}% of tokens used
            </p>
            {data.plan.slug !== 'business' && (
                <span className='mt-2 block text-xs font-medium text-green-700'>Upgrade plan →</span>
            )}
        </Link>
    );
}
