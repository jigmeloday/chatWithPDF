import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import MobileMenu from '@/components/mobile-menu';
import { SITE_NAME } from '@/config/site';
import { cn } from '@/lib/utils';

export const NAV_LINKS = [
    { href: '/#features', label: 'Features' },
    { href: '/#how-it-works', label: 'How it works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/#faq', label: 'FAQ' },
];

// Floating pill header for signed-out visitors.
function NavBar() {
    return (
        <header className='sticky top-0 z-30 px-3 pt-3 sm:px-6'>
            <nav
                aria-label='Main'
                className='mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full bg-white/80 px-3 pl-4 shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-950/10 backdrop-blur-xl sm:px-4 sm:pl-5'>
                <Link href='/' className='flex items-center gap-2.5 font-semibold'>
                    <span className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-700 text-sm font-bold text-white shadow-sm'>
                        O
                    </span>
                    {SITE_NAME}
                </Link>

                <ul className='hidden items-center gap-1 md:flex'>
                    {NAV_LINKS.map((l) => (
                        <li key={l.href}>
                            <Link
                                href={l.href}
                                className='rounded-full px-3.5 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900'>
                                {l.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className='flex items-center gap-1.5'>
                    <Link
                        href='/sign-in'
                        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden rounded-full sm:inline-flex')}>
                        Sign in
                    </Link>
                    <Link
                        href='/sign-up'
                        className={cn(buttonVariants({ size: 'sm' }), 'hidden rounded-full px-4 sm:inline-flex')}>
                        Get started <ArrowRight className='ml-1.5 h-4 w-4' />
                    </Link>
                    <MobileMenu />
                </div>
            </nav>
        </header>
    );
}

export default NavBar;
