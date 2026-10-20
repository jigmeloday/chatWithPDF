'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, KeyRound, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

const LINKS = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/documents', label: 'Documents', icon: FileText },
    { href: '/developers', label: 'API', icon: KeyRound },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function SidebarLinks() {
    const pathname = usePathname();

    return (
        <nav className='flex flex-col gap-1'>
            {LINKS.map(({ href, label, icon: Icon }) => {
                // Opening a file (/dashboard/<id>) counts as being in Documents.
                const active = href === '/dashboard'
                    ? pathname === href
                    : pathname.startsWith(href) || pathname.startsWith('/dashboard/');
                return (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            active
                                ? 'bg-green-50 text-green-800'
                                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                        )}>
                        <Icon className='h-4 w-4' />
                        {label}
                    </Link>
                );
            })}
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
            href={data.plan.slug === 'free' ? '/pricing' : '/dashboard'}
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
            {data.plan.slug === 'free' && (
                <span className='mt-2 block text-xs font-medium text-green-700'>Upgrade to Pro →</span>
            )}
        </Link>
    );
}
