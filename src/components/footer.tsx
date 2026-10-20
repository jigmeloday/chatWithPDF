import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import MaxWidthWrapper from '@/components/max-width-wrapper';
import PoweredBy from '@/components/powered-by';
import { Reveal } from '@/components/motion';
import { SITE_NAME, SUPPORT_EMAIL } from '@/config/site';

const COLUMNS = [
    {
        title: 'Product',
        links: [
            { label: 'Features', href: '/#features' },
            { label: 'How it works', href: '/#how-it-works' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'FAQ', href: '/#faq' },
        ],
    },
    {
        title: 'Developers',
        links: [
            { label: 'API keys', href: '/developers' },
            { label: 'OpenAPI spec', href: '/api/v1/openapi.json', external: true },
        ],
    },
    {
        title: 'Account',
        links: [
            { label: 'Sign in', href: '/sign-in' },
            { label: 'Create account', href: '/sign-up' },
            { label: 'Reset password', href: '/forgot-password' },
        ],
    },
];

const linkClass = 'text-sm text-zinc-400 transition hover:text-white';

function Footer() {
    return (
        <footer className='mt-16 bg-zinc-950 text-zinc-300'>
            <MaxWidthWrapper className='pt-16'>
                <Reveal>
                    <div className='grid gap-12 lg:grid-cols-5'>
                        <div className='lg:col-span-2'>
                            <Link href='/' className='inline-flex items-center gap-2.5 text-lg font-semibold text-white'>
                                <span className='flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-700 text-sm font-bold text-white'>
                                    O
                                </span>
                                {SITE_NAME}
                            </Link>
                            <p className='mt-4 max-w-sm text-sm leading-relaxed text-zinc-400'>
                                Chat with your PDFs. Upload a document, ask questions in plain language and get answers with page citations.
                            </p>
                            <Link
                                href='/sign-up'
                                className='mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-green-50 active:scale-[0.97]'>
                                Get started free <ArrowRight className='h-4 w-4' />
                            </Link>
                        </div>

                        <div className='grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3'>
                            {COLUMNS.map((col) => (
                                <nav key={col.title} aria-label={col.title}>
                                    <h3 className='text-xs font-semibold uppercase tracking-wider text-zinc-500'>{col.title}</h3>
                                    <ul className='mt-4 space-y-3'>
                                        {col.links.map((l) => (
                                            <li key={l.label}>
                                                {'external' in l ? (
                                                    <a href={l.href} target='_blank' rel='noopener noreferrer' className={linkClass}>
                                                        {l.label}
                                                    </a>
                                                ) : (
                                                    <Link href={l.href} className={linkClass}>{l.label}</Link>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            ))}
                        </div>
                    </div>
                </Reveal>

                <div className='mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-sm text-zinc-500 sm:flex-row'>
                    <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
                    <div className='flex items-center gap-5'>
                        <a href={`mailto:${SUPPORT_EMAIL}`} className='inline-flex items-center gap-1.5 transition hover:text-white'>
                            <Mail className='h-4 w-4' /> {SUPPORT_EMAIL}
                        </a>
                        <PoweredBy className='text-zinc-500 hover:text-white' />
                    </div>
                </div>
            </MaxWidthWrapper>
        </footer>
    );
}

export default Footer;
