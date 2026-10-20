'use client';
import { useMemo, useState } from 'react';
import { LayoutGrid, List, Search, UploadCloud } from 'lucide-react';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { trpc } from '@/app/_trpc/client';
import UploadButton from '@/components/upload-button';
import FileFallback from '@/components/dashboard/file-fallback';
import FileCard from '@/components/dashboard/file-card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Filter = 'ALL' | 'SUCCESS' | 'PROCESSING' | 'FAILED';
type Sort = 'newest' | 'oldest' | 'name';

const FILTERS: { value: Filter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'SUCCESS', label: 'Ready' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'FAILED', label: 'Failed' },
];

// PENDING files are shown with Processing.
const matches = (status: string, filter: Filter) =>
    filter === 'ALL' || status === filter || (filter === 'PROCESSING' && status === 'PENDING');

function Documents() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<Filter>('ALL');
    const [sort, setSort] = useState<Sort>('newest');
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const { data: files, isLoading } = trpc.getUserFiles.useQuery();
    const { data: usage } = trpc.getUsage.useQuery();

    const counts = useMemo(
        () => Object.fromEntries(FILTERS.map((f) => [f.value, (files ?? []).filter((x) => matches(x.uploadStatus, f.value)).length])),
        [files]
    );

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (files ?? [])
            .filter((f) => matches(f.uploadStatus, filter) && f.name.toLowerCase().includes(q))
            .sort((a, b) =>
                sort === 'name'
                    ? a.name.localeCompare(b.name)
                    : (+new Date(a.createdAt) - +new Date(b.createdAt)) * (sort === 'newest' ? -1 : 1)
            );
    }, [files, search, filter, sort]);

    const pct = usage ? Math.min(100, (usage.documentsUsed / usage.documentLimit) * 100) : 0;

    return (
        <main className='mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
                <div>
                    <p className='text-sm font-medium text-green-700'>Library</p>
                    <h1 className='mt-1 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl'>Documents</h1>
                    <p className='mt-1 text-zinc-500'>All the PDFs you&apos;ve uploaded, ready to chat with.</p>
                </div>
                <div className='flex items-center gap-4'>
                    {usage && (
                        <div className='hidden w-44 sm:block'>
                            <div className='flex justify-between text-xs text-zinc-500'>
                                <span>Storage</span>
                                <span>{usage.documentsUsed} / {usage.documentLimit}</span>
                            </div>
                            <div className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200'>
                                <div
                                    className={cn('h-full rounded-full', pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-600')}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    )}
                    <UploadButton />
                </div>
            </div>

            <div className='mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
                <div className='flex flex-wrap gap-2' role='tablist'>
                    {FILTERS.map((f) => (
                        <button
                            key={f.value}
                            role='tab'
                            aria-selected={filter === f.value}
                            onClick={() => setFilter(f.value)}
                            className={cn(
                                'rounded-full px-3.5 py-1.5 text-sm font-medium transition',
                                filter === f.value
                                    ? 'bg-zinc-900 text-white'
                                    : 'bg-white text-zinc-600 ring-1 ring-zinc-950/10 hover:bg-zinc-100'
                            )}>
                            {f.label}
                            <span className={cn('ml-1.5 text-xs', filter === f.value ? 'text-zinc-300' : 'text-zinc-400')}>
                                {counts[f.value] ?? 0}
                            </span>
                        </button>
                    ))}
                </div>

                <div className='flex items-center gap-2'>
                    <div className='relative flex-1 lg:w-64 lg:flex-none'>
                        <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Search documents'
                            className='h-10 bg-white pl-9'
                        />
                    </div>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as Sort)}
                        aria-label='Sort documents'
                        className='h-10 rounded-md border border-input bg-white px-3 text-sm'>
                        <option value='newest'>Newest</option>
                        <option value='oldest'>Oldest</option>
                        <option value='name'>Name</option>
                    </select>
                    <div className='flex rounded-md bg-white p-0.5 ring-1 ring-zinc-950/10'>
                        {([['grid', LayoutGrid], ['list', List]] as const).map(([v, Icon]) => (
                            <button
                                key={v}
                                aria-label={`${v} view`}
                                aria-pressed={view === v}
                                onClick={() => setView(v)}
                                className={cn(
                                    'rounded p-2 transition',
                                    view === v ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'
                                )}>
                                <Icon className='h-4 w-4' />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <FileFallback />
            ) : !files?.length ? (
                <div className='mt-6 flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-zinc-300 bg-white/60 px-6 py-20 text-center'>
                    <span className='flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-md'>
                        <UploadCloud className='h-7 w-7' />
                    </span>
                    <h3 className='text-lg font-semibold text-zinc-900'>Upload your first document</h3>
                    <p className='max-w-sm text-sm text-zinc-500'>
                        Add a PDF and start asking it questions in seconds.
                    </p>
                    <UploadButton />
                </div>
            ) : !visible.length ? (
                <p className='mt-12 text-center text-zinc-500'>No documents match your filters.</p>
            ) : (
                <ul
                    className={cn(
                        'mt-6',
                        view === 'grid'
                            ? 'grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'
                            : 'flex flex-col gap-3'
                    )}>
                    <LayoutGroup>
                        <AnimatePresence mode='popLayout'>
                            {visible.map((file) => (
                                <FileCard key={file.id} file={file} view={view} />
                            ))}
                        </AnimatePresence>
                    </LayoutGroup>
                </ul>
            )}
        </main>
    );
}

export default Documents;
