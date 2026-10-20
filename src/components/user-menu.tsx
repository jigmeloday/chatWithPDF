'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserMenuProps {
    name: string;
    email: string;
}

function UserMenu({ name, email }: UserMenuProps) {
    const router = useRouter();
    const initial = (name || email).charAt(0).toUpperCase();

    const signOut = async () => {
        await authClient.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label='Account menu'
                className='flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-green-600'>
                {initial}
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel className='flex flex-col'>
                    {name && <span className='truncate text-sm font-medium'>{name}</span>}
                    <span className='truncate text-xs font-normal text-zinc-500'>{email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href='/dashboard' className='cursor-pointer'>
                        <LayoutDashboard className='mr-2 h-4 w-4' /> Overview
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href='/settings' className='cursor-pointer'>
                        <Settings className='mr-2 h-4 w-4' /> Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={signOut} className='cursor-pointer text-red-600 focus:text-red-600'>
                    <LogOut className='mr-2 h-4 w-4' /> Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default UserMenu;
