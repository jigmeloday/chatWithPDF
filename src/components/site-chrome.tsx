'use client';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// Auth pages are full-screen and bring their own branding, so they skip the site header and footer.
const AUTH_PATHS = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'];

function SiteChrome({ nav, footer, children }: { nav: ReactNode; footer: ReactNode; children: ReactNode }) {
    const pathname = usePathname();
    const bare = AUTH_PATHS.includes(pathname);

    return (
        <div className='flex min-h-screen flex-col'>
            {!bare && nav}
            <div className='flex flex-1 flex-col'>{children}</div>
            {!bare && footer}
        </div>
    );
}

export default SiteChrome;
