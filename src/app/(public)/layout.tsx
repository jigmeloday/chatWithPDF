import { ReactNode } from 'react';
import Footer from '@/components/footer';
import NavBar from '@/components/nav-bar';
import AppShell from '@/components/app-shell';
import { getSessionUser } from '@/lib/auth';

// Marketing pages: header and footer for visitors. Signed-in users keep the app sidebar.
export default async function PublicLayout({ children }: { children: ReactNode }) {
    const user = await getSessionUser();
    if (user) return <AppShell user={user}>{children}</AppShell>;

    return (
        <div className='flex min-h-screen flex-col'>
            <NavBar />
            <div className='flex flex-1 flex-col'>{children}</div>
            <Footer />
        </div>
    );
}
