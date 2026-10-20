import { ReactNode } from 'react';

// Auth pages are full-screen and bring their own branding: no header, no footer.
export default function AuthLayout({ children }: { children: ReactNode }) {
    return <div className='flex min-h-screen flex-col'>{children}</div>;
}
