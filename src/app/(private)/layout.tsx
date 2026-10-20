import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import AppShell from '@/components/app-shell';
import { getSessionUser } from '@/lib/auth';

// Signed-in app: sidebar shell, and no way in without a session.
export default async function PrivateLayout({ children }: { children: ReactNode }) {
    const user = await getSessionUser();
    if (!user) redirect('/sign-in');

    return <AppShell user={user}>{children}</AppShell>;
}
