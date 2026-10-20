'use client';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LINKS = [
    { href: '/pricing', label: 'Pricing' },
    { href: '/sign-in', label: 'Sign in' },
    { href: '/sign-up', label: 'Get started' },
];

function MobileMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger aria-label='Open menu' className='rounded-md p-2 text-zinc-700 hover:bg-zinc-100 sm:hidden'>
                <Menu className='h-5 w-5' />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-44'>
                {LINKS.map((l) => (
                    <DropdownMenuItem key={l.href} asChild>
                        <Link href={l.href} className='cursor-pointer'>{l.label}</Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default MobileMenu;
