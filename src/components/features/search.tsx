'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { FileText, Loader2, Search as SearchIcon } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

// Wraps words from the query in <mark> so the match is easy to spot.
function Highlight({ text, query }: { text: string; query: string }) {
    const words = query.split(/\s+/).filter((w) => w.length > 2).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!words.length) return <>{text}</>;
    const parts = text.split(new RegExp(`(${words.join('|')})`, 'gi'));
    return (
        <>
            {parts.map((p, i) =>
                words.some((w) => new RegExp(`^${w}$`, 'i').test(p)) ? (
                    <mark key={i} className='rounded bg-green-100 px-0.5 text-green-900'>{p}</mark>
                ) : (
                    <span key={i}>{p}</span>
                )
            )}
        </>
    );
}

const EXAMPLES = ['payment deadline', 'who are the parties', 'termination clause', 'total cost'];

function Search() {
    const [input, setInput] = useState('');
    const [query, setQuery] = useState('');
    const { data, isFetching, error } = trpc.searchDocuments.useQuery({ query }, { enabled: query.length >= 2, retry: false });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setQuery(input.trim());
    };

    return (
        <main className='mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8'>
            <p className='text-sm font-medium text-green-700'>Search</p>
            <h1 className='mt-1 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl'>Search all your documents</h1>
            <p className='mt-1 text-zinc-500'>Search by meaning, not just keywords. Results open the document at the right page.</p>

            <form onSubmit={submit} className='mt-6 flex gap-2'>
                <div className='relative flex-1'>
                    <SearchIcon className='pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder='e.g. when is the payment due?'
                        className='h-12 bg-white pl-10 text-base'
                        autoFocus
                    />
                </div>
                <Button type='submit' size='lg' disabled={input.trim().length < 2 || isFetching} className='h-12'>
                    {isFetching ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Search'}
                </Button>
            </form>

            {!query && (
                <div className='mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500'>
                    Try:
                    {EXAMPLES.map((ex) => (
                        <button
                            key={ex}
                            onClick={() => {
                                setInput(ex);
                                setQuery(ex);
                            }}
                            className='rounded-full bg-white px-3 py-1 text-zinc-700 ring-1 ring-zinc-950/10 transition hover:bg-green-50 hover:ring-green-500/40'>
                            {ex}
                        </button>
                    ))}
                </div>
            )}

            {error && <p className='mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700'>{error.message}</p>}

            {query && !isFetching && data && !data.length && (
                <Reveal>
                    <p className='mt-10 text-center text-zinc-500'>Nothing found. Upload more documents or try different words.</p>
                </Reveal>
            )}

            {!!data?.length && (
                <Stagger key={query} onMount as='ul' className='mt-6 space-y-3'>
                    {data.map((r, i) => (
                        <StaggerItem as='li' key={`${r.fileId}-${r.page}-${i}`}>
                            <Link
                                href={`/dashboard/${r.fileId}?page=${r.page}`}
                                className='block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-950/5 transition hover:shadow-md hover:ring-green-500/40'>
                                <div className='flex items-center gap-2 text-sm'>
                                    <FileText className='h-4 w-4 text-green-700' />
                                    <span className='truncate font-medium text-zinc-900'>{r.name}</span>
                                    <span className='rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600'>Page {r.page}</span>
                                    <span className='ml-auto text-xs text-zinc-400'>{r.score}% match</span>
                                </div>
                                <p className='mt-2 text-sm leading-relaxed text-zinc-600'>
                                    <Highlight text={r.snippet} query={query} />…
                                </p>
                            </Link>
                        </StaggerItem>
                    ))}
                </Stagger>
            )}
        </main>
    );
}

export default Search;
