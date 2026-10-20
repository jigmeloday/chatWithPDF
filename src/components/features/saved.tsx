'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { Bookmark, Check, Copy, Download, FileText, Loader2, NotebookPen, Search, Trash } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stagger, StaggerItem } from '@/components/motion';
import { useToast } from '@/hooks/use-toast';

interface SavedItem {
    id: string;
    fileId: string | null;
    fileName: string | null;
    question: string;
    answer: string;
    note: string | null;
    createdAt: string | Date;
}

function SavedCard({ item }: { item: SavedItem }) {
    const utils = trpc.useContext();
    const { toast } = useToast();
    const [editing, setEditing] = useState(false);
    const [note, setNote] = useState(item.note ?? '');
    const [copied, setCopied] = useState(false);

    const { mutate: saveNote, isLoading: savingNote } = trpc.updateSavedNote.useMutation({
        onSuccess: () => {
            utils.listSaved.invalidate();
            setEditing(false);
            toast({ title: 'Note saved' });
        },
    });
    const { mutate: remove, isLoading: removing } = trpc.deleteSaved.useMutation({
        onSuccess: () => {
            utils.listSaved.invalidate();
            toast({ title: 'Removed from saved' });
        },
    });

    const copy = async () => {
        await navigator.clipboard.writeText(item.answer);
        setCopied(true);
        toast({ title: 'Copied to clipboard' });
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <StaggerItem as='li' className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-950/5'>
            <div className='flex items-center gap-2 text-xs text-zinc-500'>
                <FileText className='h-3.5 w-3.5' />
                {item.fileId ? (
                    <Link href={`/dashboard/${item.fileId}`} className='truncate font-medium text-zinc-700 hover:text-green-700 hover:underline'>
                        {item.fileName}
                    </Link>
                ) : (
                    <span className='truncate font-medium text-zinc-700'>{item.fileName}</span>
                )}
                <span className='ml-auto shrink-0'>{format(new Date(item.createdAt), 'MMM d, yyyy')}</span>
            </div>

            {item.question && <h3 className='mt-3 font-semibold text-zinc-900'>{item.question}</h3>}
            <ReactMarkdown className='prose prose-sm mt-2 max-w-none text-zinc-700 prose-p:my-1.5'>{item.answer}</ReactMarkdown>

            {editing ? (
                <div className='mt-3 flex gap-2'>
                    <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder='Add a note' maxLength={1000} autoFocus className='h-9' />
                    <Button size='sm' disabled={savingNote} onClick={() => saveNote({ id: item.id, note })}>
                        {savingNote ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Save'}
                    </Button>
                    <Button size='sm' variant='ghost' onClick={() => setEditing(false)}>Cancel</Button>
                </div>
            ) : (
                item.note && (
                    <p className='mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-600/10'>
                        <NotebookPen className='mr-1.5 inline h-3.5 w-3.5' />
                        {item.note}
                    </p>
                )
            )}

            <div className='mt-4 flex items-center gap-1 border-t border-zinc-100 pt-3'>
                <Button size='sm' variant='ghost' onClick={copy} className='text-zinc-600'>
                    {copied ? <Check className='mr-1.5 h-4 w-4' /> : <Copy className='mr-1.5 h-4 w-4' />} Copy
                </Button>
                <Button size='sm' variant='ghost' onClick={() => setEditing(true)} className='text-zinc-600'>
                    <NotebookPen className='mr-1.5 h-4 w-4' /> {item.note ? 'Edit note' : 'Add note'}
                </Button>
                <Button
                    size='sm'
                    variant='ghost'
                    disabled={removing}
                    onClick={() => remove({ id: item.id })}
                    className='ml-auto text-zinc-400 hover:bg-red-50 hover:text-red-600'>
                    {removing ? <Loader2 className='h-4 w-4 animate-spin' /> : <Trash className='h-4 w-4' />}
                </Button>
            </div>
        </StaggerItem>
    );
}

const toMarkdown = (items: SavedItem[]) =>
    items
        .map((i) => `## ${i.question || 'Saved answer'}\n*${i.fileName ?? 'Document'} · ${format(new Date(i.createdAt), 'MMM d, yyyy')}*\n\n${i.answer}${i.note ? `\n\n> Note: ${i.note}` : ''}`)
        .join('\n\n---\n\n');

function Saved() {
    const { data, isLoading } = trpc.listSaved.useQuery();
    const [search, setSearch] = useState('');

    const items = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (data ?? []).filter((i) => !q || [i.question, i.answer, i.note ?? '', i.fileName ?? ''].some((t) => t.toLowerCase().includes(q)));
    }, [data, search]);

    const exportAll = () => {
        const blob = new Blob([toMarkdown(data ?? [])], { type: 'text/markdown' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'otterly-saved-answers.md';
        a.click();
        URL.revokeObjectURL(a.href);
    };

    return (
        <main className='mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
                <div>
                    <p className='text-sm font-medium text-green-700'>Notebook</p>
                    <h1 className='mt-1 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl'>Saved answers</h1>
                    <p className='mt-1 text-zinc-500'>Bookmark answers from any chat, add notes and export them.</p>
                </div>
                {!!data?.length && (
                    <Button variant='outline' onClick={exportAll}>
                        <Download className='mr-2 h-4 w-4' /> Export Markdown
                    </Button>
                )}
            </div>

            {!!data?.length && (
                <div className='relative mt-6 max-w-sm'>
                    <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search saved answers' className='h-10 bg-white pl-9' />
                </div>
            )}

            {isLoading ? (
                <p className='mt-10 text-center text-zinc-500'>Loading…</p>
            ) : !data?.length ? (
                <div className='mt-8 flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-zinc-300 bg-white/60 px-6 py-16 text-center'>
                    <span className='flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-md'>
                        <Bookmark className='h-7 w-7' />
                    </span>
                    <h3 className='text-lg font-semibold text-zinc-900'>Nothing saved yet</h3>
                    <p className='max-w-sm text-sm text-zinc-500'>Hover an answer in any chat and click the bookmark icon to keep it here.</p>
                </div>
            ) : !items.length ? (
                <p className='mt-10 text-center text-zinc-500'>No saved answers match your search.</p>
            ) : (
                <Stagger onMount as='ul' className='mt-6 space-y-4' gap={0.06}>
                    {items.map((item) => (
                        <SavedCard key={item.id} item={item} />
                    ))}
                </Stagger>
            )}
        </main>
    );
}

export default Saved;
