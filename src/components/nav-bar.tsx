'use client';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { handleAnchorClick } from '@/lib/smooth-scroll';
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

const SCROLL_DISTANCE = 120; // px of scrolling over which the pill spreads to full width

// Floating pill header that spreads to a full-width bar as the page scrolls.
// Scroll position drives motion values through a spring, so it stays smooth and never re-renders React.
// The header keeps a fixed height, so page content never shifts under the cursor.
function NavBar() {
    const pathname = usePathname();
    const { scrollY } = useScroll();
    const progress = useSpring(useTransform(scrollY, [0, SCROLL_DISTANCE], [0, 1], { clamp: true }), {
        stiffness: 220,
        damping: 32,
        mass: 0.4,
    });

    // Pure CSS expressions keep this identical on the server and the client.
    const width = useTransform(progress, (p) => `calc(100% - ${(1 - p) * 24}px)`);
    const maxWidth = useTransform(progress, (p) => `calc(1024px + (100vw - 1024px) * ${p})`);
    const marginTop = useTransform(progress, [0, 1], [12, 0]);
    const borderRadius = useTransform(progress, [0, 1], [28, 0]);
    const boxShadow = useTransform(
        progress,
        (p) => `0 10px 25px -5px rgba(24,24,27,${0.06 * (1 - p)}), 0 0 0 1px rgba(9,9,11,${0.1 * (1 - p)})`
    );
    const borderBottomColor = useTransform(progress, [0, 1], ['rgba(228,228,231,0)', 'rgba(228,228,231,1)']);

    return (
        <header className='pointer-events-none sticky top-0 z-30 h-[68px]'>
            <motion.nav
                aria-label='Main'
                style={{ width, maxWidth, marginTop, borderRadius, boxShadow, borderBottomColor, borderBottomWidth: 1, borderBottomStyle: 'solid' }}
                className='pointer-events-auto mx-auto bg-white/80 backdrop-blur-xl'>
                <div className='mx-auto flex h-14 max-w-6xl items-center justify-between px-3 pl-4 sm:px-5'>
                    <Link
                        href='/'
                        onClick={(e) => {
                            if (pathname === '/') {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}
                        className='flex items-center gap-2.5 font-semibold'>
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
                                    onClick={(e) => handleAnchorClick(e, l.href, pathname)}
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
            </motion.nav>
        </header>
    );
}

export default NavBar;
