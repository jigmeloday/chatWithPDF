import Link from 'next/link';
import {
    ArrowRight,
    BarChart3,
    BookOpenCheck,
    Check,
    Code2,
    FileText,
    Lock,
    MessageSquare,
    Quote,
    Sparkles,
    Upload,
    Zap,
} from 'lucide-react';
import { PLANS, PLAN_ORDER } from '@/config/plans';
import { SUPPORT_EMAIL } from '@/config/site';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STEPS = [
    { icon: Upload, title: 'Upload your PDF', text: 'Drag in any PDF with selectable text. We process it in seconds and get it ready to chat with.' },
    { icon: MessageSquare, title: 'Ask anything', text: 'Type a question in plain language, or start from a suggestion like "Summarize this document".' },
    { icon: BookOpenCheck, title: 'Get cited answers', text: 'Every answer points to the pages it came from. Click a citation to jump straight to that page.' },
];

const FEATURES = [
    { icon: Quote, title: 'Page citations', text: 'Answers reference the exact pages they use, so you can verify them in one click.' },
    { icon: Zap, title: 'Streaming answers', text: 'Responses appear as they are written, with no waiting for a full reply.' },
    { icon: Lock, title: 'Private by default', text: 'Only you can open your documents. Delete a file or your whole account any time.' },
    { icon: BarChart3, title: 'Clear usage', text: 'Track tokens, documents and days left on your dashboard, with warnings before you hit a limit.' },
    { icon: Code2, title: 'Developer API', text: 'Upload documents and ask questions from your own apps with a simple REST API.' },
    { icon: Sparkles, title: 'Built for long documents', text: 'Contracts, papers, manuals and reports: it finds the relevant parts instead of reading everything.' },
];

const FAQ = [
    { q: 'What are tokens?', a: 'Tokens measure how much text the AI reads and writes when answering. Your plan includes a monthly allowance, and you can see how much you have left on your dashboard.' },
    { q: 'Is my document private?', a: 'Yes. Only you can open your documents, and you can delete them at any time. Deleting an account removes all of its data.' },
    { q: 'What kinds of PDFs work?', a: 'Any PDF with selectable text up to 4MB. Scanned images without text are not supported yet.' },
    { q: 'Can I use it from my own app?', a: 'Yes. Create an API key in your dashboard and call the API to upload documents, check usage and ask questions.' },
    { q: 'How do I contact support?', a: `Email us at ${SUPPORT_EMAIL} and we'll get back to you.` },
    { q: 'Can I cancel any time?', a: 'Yes. Manage or cancel your subscription from settings, and you keep Pro until the end of the period you paid for.' },
];

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
    return (
        <div className='mx-auto max-w-2xl text-center'>
            <p className='text-sm font-semibold uppercase tracking-wider text-green-700'>{eyebrow}</p>
            <h2 className='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>{title}</h2>
            {text && <p className='mt-3 text-lg text-gray-600'>{text}</p>}
        </div>
    );
}

// A static mock of the product, so visitors can see what they get.
function ProductPreview() {
    return (
        <div className='mx-auto max-w-5xl px-6'>
            <div className='overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-950/10'>
                <div className='flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3'>
                    <span className='h-3 w-3 rounded-full bg-red-400' />
                    <span className='h-3 w-3 rounded-full bg-amber-400' />
                    <span className='h-3 w-3 rounded-full bg-green-400' />
                    <span className='ml-3 truncate text-xs text-zinc-500'>quarterly-report.pdf</span>
                </div>
                <div className='grid md:grid-cols-5'>
                    <div className='hidden border-r border-zinc-200 bg-zinc-100 p-6 md:col-span-3 md:block'>
                        <div className='mx-auto max-w-sm space-y-2.5 rounded-md bg-white p-6 shadow-sm'>
                            <div className='h-3 w-1/2 rounded bg-zinc-300' />
                            {[100, 95, 100, 80, 100, 90, 60].map((w, i) => (
                                <div key={i} className={cn('h-2 rounded bg-zinc-200', i === 3 && 'bg-green-200')} style={{ width: `${w}%` }} />
                            ))}
                            <div className='h-3 w-1/3 rounded bg-zinc-300 pt-1' />
                            {[100, 92, 100, 70].map((w, i) => (
                                <div key={i} className='h-2 rounded bg-zinc-200' style={{ width: `${w}%` }} />
                            ))}
                        </div>
                    </div>
                    <div className='flex flex-col gap-3 bg-zinc-50 p-5 md:col-span-2'>
                        <div className='ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-green-600 px-4 py-2.5 text-sm text-white'>
                            What drove revenue growth this quarter?
                        </div>
                        <div className='max-w-[90%] rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 text-sm text-zinc-800 shadow-sm ring-1 ring-zinc-950/5'>
                            Revenue grew <b>18%</b>, mainly from new enterprise contracts and higher renewal rates{' '}
                            <span className='font-medium text-green-700 underline decoration-dotted'>(p. 4)</span>.
                        </div>
                        <div className='ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-green-600 px-4 py-2.5 text-sm text-white'>
                            Any risks mentioned?
                        </div>
                        <div className='flex max-w-[60%] gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-950/5'>
                            {[0, 1, 2].map((i) => (
                                <span key={i} className='h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400' style={{ animationDelay: `${i * 120}ms` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LandingSections() {
    return (
        <>
            <section className='mt-24 sm:mt-32'>
                <ProductPreview />
            </section>

            {/* How it works */}
            <section id='how-it-works' className='mx-auto mt-28 max-w-5xl scroll-mt-28 px-6'>
                <SectionHeading eyebrow='How it works' title='Start chatting in minutes' text='Three steps from a PDF to answers you can trust.' />
                <ol className='mt-12 grid gap-6 md:grid-cols-3'>
                    {STEPS.map(({ icon: Icon, title, text }, i) => (
                        <li key={title} className='relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-950/10'>
                            <span className='absolute right-5 top-4 text-5xl font-bold text-zinc-100'>{i + 1}</span>
                            <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-sm'>
                                <Icon className='h-5 w-5' />
                            </span>
                            <h3 className='mt-5 text-lg font-semibold'>{title}</h3>
                            <p className='mt-2 text-sm text-zinc-600'>{text}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* Features */}
            <section id='features' className='mx-auto mt-28 max-w-6xl scroll-mt-28 px-6'>
                <SectionHeading eyebrow='Features' title='Everything you need to understand your documents' />
                <div className='mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3'>
                    {FEATURES.map(({ icon: Icon, title, text }) => (
                        <div key={title} className='flex gap-4'>
                            <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700'>
                                <Icon className='h-5 w-5' />
                            </span>
                            <div>
                                <h3 className='font-semibold text-zinc-900'>{title}</h3>
                                <p className='mt-1 text-sm text-zinc-600'>{text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* API */}
            <section className='mx-auto mt-28 max-w-6xl px-6'>
                <div className='grid items-center gap-10 overflow-hidden rounded-3xl bg-zinc-900 p-8 text-white md:grid-cols-2 md:p-12'>
                    <div>
                        <p className='text-sm font-semibold uppercase tracking-wider text-green-400'>For developers</p>
                        <h2 className='mt-2 text-3xl font-bold tracking-tight'>Build on your documents</h2>
                        <p className='mt-3 text-zinc-300'>
                            Upload PDFs and ask questions from your own app. One API key, a simple REST API and the same plan limits.
                        </p>
                        <ul className='mt-6 space-y-2 text-sm text-zinc-200'>
                            {['Upload, list and chat endpoints', 'OpenAPI spec included', 'Per-key usage tracking'].map((f) => (
                                <li key={f} className='flex items-center gap-2'><Check className='h-4 w-4 text-green-400' /> {f}</li>
                            ))}
                        </ul>
                    </div>
                    <pre className='overflow-x-auto rounded-xl bg-black/50 p-5 text-xs leading-relaxed text-zinc-200 ring-1 ring-white/10 sm:text-sm'>
{`curl -X POST /api/v1/chat \\
  -H "Authorization: Bearer dc_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "document_id": "doc_123",
    "message": "Summarize the key risks"
  }'

{ "answer": "The main risks are ... (p. 7)",
  "usage": { "input_tokens": 812,
             "output_tokens": 164 } }`}
                    </pre>
                </div>
            </section>

            {/* Pricing */}
            <section id='pricing' className='mx-auto mt-28 max-w-6xl scroll-mt-28 px-6'>
                <SectionHeading eyebrow='Pricing' title='Simple plans, no surprises' text='Start free. Upgrade when you need more.' />
                <div className='mt-10 grid gap-6 lg:grid-cols-3'>
                    {PLAN_ORDER.map((slug) => {
                        const plan = PLANS[slug];
                        const isPro = plan.slug === 'pro';
                        return (
                            <div
                                key={plan.slug}
                                className={cn('relative rounded-3xl bg-white p-7 shadow-sm ring-1', isPro ? 'shadow-lg ring-2 ring-green-600' : 'ring-zinc-950/10')}>
                                {isPro && (
                                    <span className='absolute -top-3 left-7 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white'>Most popular</span>
                                )}
                                <h3 className='text-lg font-semibold'>{plan.name}</h3>
                                <p className='mt-2'>
                                    <span className='text-4xl font-bold'>${plan.price}</span>
                                    <span className='text-zinc-500'> / month</span>
                                </p>
                                <ul className='mt-5 space-y-2.5 text-sm text-zinc-700'>
                                    {plan.features.map((f) => (
                                        <li key={f} className='flex items-center gap-2'><Check className='h-4 w-4 text-green-600' /> {f}</li>
                                    ))}
                                </ul>
                                <Link
                                    href='/sign-up'
                                    className={cn(buttonVariants({ variant: isPro ? 'default' : 'outline' }), 'mt-7 w-full')}>
                                    {plan.price === 0 ? 'Start for free' : `Get started with ${plan.name}`}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* FAQ */}
            <section id='faq' className='mx-auto mt-28 max-w-3xl scroll-mt-28 px-6'>
                <SectionHeading eyebrow='FAQ' title='Questions, answered' />
                <div className='mt-10 divide-y divide-zinc-200 rounded-2xl bg-white shadow-sm ring-1 ring-zinc-950/10'>
                    {FAQ.map(({ q, a }) => (
                        <details key={q} className='group p-5'>
                            <summary className='flex cursor-pointer list-none items-center justify-between font-medium'>
                                {q}
                                <span className='ml-4 text-xl leading-none text-zinc-400 transition group-open:rotate-45'>+</span>
                            </summary>
                            <p className='mt-3 text-sm text-zinc-600'>{a}</p>
                        </details>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className='mx-auto mb-24 mt-28 max-w-6xl px-6'>
                <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-900 px-8 py-14 text-center text-white shadow-lg'>
                    <div className='pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl' />
                    <FileText className='mx-auto h-8 w-8 text-green-200' />
                    <h2 className='mt-4 text-3xl font-bold tracking-tight sm:text-4xl'>Ready to talk to your documents?</h2>
                    <p className='mx-auto mt-3 max-w-xl text-green-50/90'>Create a free account and ask your first question in under a minute.</p>
                    <Link href='/sign-up' className={cn(buttonVariants({ size: 'lg' }), 'relative mt-8 bg-white text-green-800 hover:bg-green-50')}>
                        Get started free <ArrowRight className='ml-2 h-4 w-4' />
                    </Link>
                </div>
            </section>
        </>
    );
}

export default LandingSections;
