import Link from 'next/link';
import MaxWidthWrapper from '@/components/max-width-wrapper';

function Footer() {
    return (
        <footer className='border-t border-zinc-200 bg-white/60'>
            <MaxWidthWrapper className='flex flex-col items-center justify-between gap-4 py-8 text-sm text-zinc-500 sm:flex-row'>
                <p>© {new Date().getFullYear()} DocuChatty. All rights reserved.</p>
                <nav className='flex gap-6'>
                    <Link href='/pricing' className='hover:text-zinc-900'>Pricing</Link>
                    <Link href='/sign-in' className='hover:text-zinc-900'>Sign in</Link>
                    <Link href='/sign-up' className='hover:text-zinc-900'>Get started</Link>
                </nav>
            </MaxWidthWrapper>
        </footer>
    );
}

export default Footer;
