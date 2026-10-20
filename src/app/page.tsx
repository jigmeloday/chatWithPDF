import MaxWidthWrapper from '@/components/max-width-wrapper';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { ArrowRight, Check, Code2, MessageCircleQuestion, Search } from 'lucide-react';
import { PLANS } from '@/config/plans';
import { buttonVariants } from '@/components/ui/button';

const FAQ = [
    { q: 'What are tokens?', a: 'Tokens measure how much text the AI reads and writes when answering. Your plan includes a monthly allowance, and you can see how much you have left on your dashboard.' },
    { q: 'Is my document private?', a: 'Yes. Only you can open your documents, and you can delete them at any time. Deleting an account removes all of its data.' },
    { q: 'What kinds of PDFs work?', a: 'Any PDF with selectable text up to 4MB. Scanned images without text are not supported yet.' },
    { q: 'Can I use it from my own app?', a: 'Yes. Create an API key in your dashboard and call the API to list documents, check usage and ask questions.' },
    { q: 'Can I cancel any time?', a: 'Yes. Manage or cancel your subscription from settings, and you keep Pro until the end of the period you paid for.' },
]

export default async function Home() {
    if ( await getSessionUser() ) redirect('/dashboard');

    return (
        <div>
            <MaxWidthWrapper
                className='relative mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center'>
                <div
                    className='mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50'>
                    <p className='text-sm font-semibold text-gray-700'>
                        DocuChatty is now public!
                    </p>
                </div>
                <h1 className='max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl'>
                    Chat with your{ ' ' }
                    <span className='text-green-600'>documents</span>{ ' ' }
                    in seconds.
                </h1>
                <p className='mt-5 max-w-prose text-green-900 sm:text-lg'>
                    DocuChatty allows you to have conversations with any
                    PDF document. Simply upload your file and start
                    asking questions right away.
                </p>
                <Link
                    className={ buttonVariants( {
                        size: 'lg',
                        className: 'mt-5',
                    } ) }
                    href='/sign-up'>
                    Get started{ ' ' }
                    <ArrowRight className='ml-2 h-5 w-5'/>
                </Link>
            </MaxWidthWrapper>

            {/* value proposition section */ }
            <div>
                <div className='relative isolate'>
                    <div
                        aria-hidden='true'
                        className='pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80'>
                        <div
                            style={ {
                                clipPath:
                                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                            } }
                            className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#80ff80] to-[#00cc00] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]'
                        />
                    </div>

                    <div
                        className='flex flex-col lg:flex-row justify-center items-center space-y-8 lg:space-y-0 lg:space-x-12 mx-auto max-w-6xl px-6 lg:px-8'>
                        <div
                            className='flex flex-col justify-between bg-gray-900/5 p-8 rounded-md w-full lg:w-1/3 h-[200px]'>
                            <p className='text-zinc-600'>Question & Answer on Document Content</p>
                            <MessageCircleQuestion className='text-green-600'/>
                        </div>
                        <div
                            className='flex flex-col justify-between bg-gray-900/5 p-8 rounded-md w-full lg:w-1/3 h-[200px]'>
                            <p className='text-zinc-600'>Search and Summarize PDF Content</p>
                            <Search className='text-green-600'/>
                        </div>
                        <div
                            className='flex flex-col justify-between bg-gray-900/5 p-8 rounded-md w-full lg:w-1/3 h-[200px]'>
                            <p className='text-zinc-600'>Developer API to build on your documents</p>
                            <Code2 className='text-green-600'/>
                        </div>
                    </div>

                    <div
                        aria-hidden='true'
                        className='pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80'>
                        <div
                            style={ {
                                clipPath:
                                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                            } }
                            className='relative left-[calc(50%-13rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]'
                        />
                    </div>
                </div>
            </div>

            {/* Feature section */ }
            <div className='mx-auto mb-32 mt-32 max-w-5xl sm:mt-56'>
                <div className='mb-12 px-6 lg:px-8'>
                    <div className='mx-auto max-w-2xl sm:text-center'>
                        <h2 className='mt-2 font-bold text-4xl text-gray-900 sm:text-5xl'>
                            Start chatting in minutes
                        </h2>
                        <p className='mt-4 text-lg text-gray-600'>
                            Chatting to your PDF files has never been
                            easier than with DocuChatty.
                        </p>
                    </div>
                </div>

                {/* steps */ }
                <ol className='my-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-0'>
                    <li className='md:flex-1'>
                        <div
                            className='flex flex-col space-y-2 border-l-4 border-green-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4'>
                            <span className='text-sm font-medium text-green-600'>
                                Step 1
                            </span>
                            <span className='text-xl font-semibold'>
                                Sign up for an account
                            </span>
                            <span className='mt-2 text-zinc-700'>
                                Either starting out with a free plan or
                                choose our{ ' ' }
                                <Link href='/pricing' className='text-green-700 underline underline-offset-2'>
                                    pro plan
                                </Link>
                                .
                            </span>
                        </div>
                    </li>
                    <li className='md:flex-1'>
                        <div
                            className='flex flex-col space-y-2 border-l-4 border-green-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4'>
                            <span className='text-sm font-medium text-green-600'>
                                Step 2
                            </span>
                            <span className='text-xl font-semibold'>
                                Upload your PDF file
                            </span>
                            <span className='mt-2 text-zinc-700'>
                                We&apos;ll process your file and make it
                                ready for you to chat with.
                            </span>
                        </div>
                    </li>
                    <li className='md:flex-1'>
                        <div
                            className='flex flex-col space-y-2 border-l-4 border-green-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4'>
                            <span className='text-sm font-medium text-green-600'>
                                Step 3
                            </span>
                            <span className='text-xl font-semibold'>
                                Start asking questions
                            </span>
                            <span className='mt-2 text-zinc-700'>
                                It&apos;s that simple. Try out DocuChatty today -
                                it really takes less than a minute.
                            </span>
                        </div>
                    </li>
                </ol>
            </div>

            {/* Pricing */ }
            <section className='mx-auto mb-32 max-w-4xl px-6'>
                <h2 className='text-center text-4xl font-bold text-gray-900'>Pricing</h2>
                <p className='mx-auto mt-3 max-w-xl text-center text-gray-600'>Start free. Upgrade when you need more.</p>
                <div className='mt-10 grid gap-6 md:grid-cols-2'>
                    { Object.values(PLANS).map((plan) => (
                        <div key={ plan.slug } className='rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-950/10'>
                            <h3 className='text-lg font-semibold'>{ plan.name }</h3>
                            <p className='mt-2'>
                                <span className='text-4xl font-bold'>${ plan.price }</span>
                                <span className='text-zinc-500'> / month</span>
                            </p>
                            <ul className='mt-4 space-y-2 text-sm text-zinc-700'>
                                { plan.features.map((f) => (
                                    <li key={ f } className='flex items-center gap-2'>
                                        <Check className='h-4 w-4 text-green-600'/> { f }
                                    </li>
                                )) }
                            </ul>
                        </div>
                    )) }
                </div>
                <div className='mt-8 text-center'>
                    <Link href='/pricing' className={ buttonVariants({ variant: 'outline' }) }>
                        Compare plans
                    </Link>
                </div>
            </section>

            {/* FAQ */ }
            <section className='mx-auto mb-32 max-w-3xl px-6'>
                <h2 className='text-center text-4xl font-bold text-gray-900'>Questions</h2>
                <div className='mt-10 divide-y divide-zinc-200 rounded-2xl bg-white shadow-sm ring-1 ring-zinc-950/10'>
                    { FAQ.map(({ q, a }) => (
                        <details key={ q } className='group p-5'>
                            <summary className='flex cursor-pointer list-none items-center justify-between font-medium'>
                                { q }
                                <span className='ml-4 text-zinc-400 transition group-open:rotate-45'>+</span>
                            </summary>
                            <p className='mt-3 text-sm text-zinc-600'>{ a }</p>
                        </details>
                    )) }
                </div>
            </section>
        </div>
    );
}
