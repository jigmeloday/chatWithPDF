'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { handleAnchorClick } from '@/lib/smooth-scroll';
import { Menu } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LINKS = [
    { href: '/#features', label: 'Features' },
    { href: '/#how-it-works', label: 'How it works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/#faq', label: 'FAQ' },
    { href: '/sign-in', label: 'Sign in' },
    { href: '/sign-up', label: 'Get started' },
];

function MobileMenu() {
    const pathname = usePathname();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger aria-label='Open menu' className='rounded-full p-2 text-zinc-700 hover:bg-zinc-100 md:hidden'>
                <Menu className='h-5 w-5' />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-44'>
                {LINKS.map((l) => (
                    <DropdownMenuItem key={l.href} asChild>
                        <Link href={l.href} onClick={(e) => handleAnchorClick(e, l.href, pathname)} className='cursor-pointer'>{l.label}</Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default MobileMenu;
