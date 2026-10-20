import Link from 'next/link';
import { PropsWithChildren } from 'react';
import UserMenu from '@/components/user-menu';
import PoweredBy from '@/components/powered-by';
import { SidebarLinks, SidebarUsage, SignOutButton } from '@/components/sidebar-nav';

interface AppShellProps extends PropsWithChildren {
    user: { name: string; email: string };
}

function AppShell({ user, children }: AppShellProps) {
    return (
        <div className='md:flex bg-zinc-50'>
            <aside className='sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-zinc-200 bg-white/80 p-4 backdrop-blur-lg md:flex'>
                <Link href='/dashboard' className='flex items-center gap-2.5 px-2 py-2 text-lg font-semibold'>
                    <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 text-sm font-bold text-white shadow-sm'>
                        O
                    </span>
                    Otterly
                </Link>
                <div className='mt-6 flex-1 overflow-y-auto pr-1'>
                    <SidebarLinks />
                </div>
                <div className='mb-4'>
                    <SidebarUsage />
                </div>
                <div className='flex items-center gap-3 border-t border-zinc-200 pt-4'>
                    <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white'>
                        {(user.name || user.email).charAt(0).toUpperCase()}
                    </span>
                    <div className='min-w-0 flex-1'>
                        {user.name && <p className='truncate text-sm font-medium'>{user.name}</p>}
                        <p className='truncate text-xs text-zinc-500'>{user.email}</p>
                    </div>
                    <SignOutButton />
                </div>
                <PoweredBy className='mt-4 text-center' />
            </aside>

            <div className='min-w-0 flex-1'>
                <header className='sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/75 px-4 backdrop-blur-lg md:hidden'>
                    <Link href='/dashboard' className='font-semibold'>
                        Otterly
                    </Link>
                    <UserMenu name={user.name} email={user.email} />
                </header>
                {children}
            </div>
        </div>
    );
}

export default AppShell;
