'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import MobileMenu from '@/components/mobile-menu';
import { SITE_NAME } from '@/config/site';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
    { href: '/#features', label: 'Features' },
    { href: '/#how-it-works', label: 'How it works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/#faq', label: 'FAQ' },
];

// Floating pill header that spreads to a full-width bar once the page is scrolled.
function NavBar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header className={cn('sticky top-0 z-30 transition-[padding] duration-300', scrolled ? 'px-0 pt-0' : 'px-3 pt-3 sm:px-6')}>
            <nav
                aria-label='Main'
                className={cn(
                    'mx-auto bg-white/80 backdrop-blur-xl transition-all duration-300',
                    scrolled
                        ? 'max-w-[100%] rounded-none shadow-sm ring-0 border-b border-zinc-200'
                        : 'max-w-5xl rounded-full shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-950/10'
                )}>
                <div
                    className={cn(
                        'mx-auto flex h-14 items-center justify-between transition-all duration-300',
                        scrolled ? 'max-w-6xl px-4 sm:px-6' : 'px-3 pl-4 sm:px-4 sm:pl-5'
                    )}>
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
                </div>
            </nav>
        </header>
    );
}

export default NavBar;
