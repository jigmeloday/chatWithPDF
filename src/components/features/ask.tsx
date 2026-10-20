'use client';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, FileText, Layers, Loader2, MessageSquarePlus, Send, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { trpc } from '@/app/_trpc/client';
import Message from '@/components/chat/message';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Stagger, StaggerItem } from '@/components/motion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const STARTERS = ['Compare these documents', 'What do they have in common?', 'Summarize each document in one line', 'Where do they disagree?'];

function AskAi() {
    const { toast } = useToast();
    const utils = trpc.useContext();
    const [chatId, setChatId] = useState<string | null>(null);
    const [selected, setSelected] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
    const [pendingAnswer, setPendingAnswer] = useState('');
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const endRef = useRef<HTMLDivElement>(null);

    const { data: files } = trpc.getUserFiles.useQuery();
    const { data: chats } = trpc.listChats.useQuery();
    const { data: chat } = trpc.getChatMessages.useQuery({ chatId: chatId ?? '' }, { enabled: !!chatId });
    const { mutate: deleteChat } = trpc.deleteChat.useMutation({
        onSuccess: () => {
            utils.listChats.invalidate();
            toast({ title: 'Chat deleted' });
        },
    });
    const { mutate: saveAnswer } = trpc.saveAnswer.useMutation({
        onSuccess: () => toast({ title: 'Saved', description: 'Find it under Saved in the sidebar.' }),
    });

    const ready = (files ?? []).filter((f) => f.uploadStatus === 'SUCCESS');
    const nameOf = (id: string) => files?.find((f) => f.id === id)?.name ?? 'Document';
    const activeIds = chatId ? chat?.fileIds ?? [] : selected;
    const messages = chat?.messages ?? [];

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, pendingQuestion, pendingAnswer]);

    const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 10 ? [...s, id] : s));

    const newChat = () => {
        setChatId(null);
        setInput('');
        setPendingQuestion(null);
        setPendingAnswer('');
    };

    const send = async (text?: string) => {
        const question = (text ?? input).trim();
        if (!question || sending || (!chatId && !selected.length)) return;

        setInput('');
        setPendingQuestion(question);
        setPendingAnswer('');
        setSending(true);
        let id = chatId;

        try {
            const res = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: question, ...(chatId ? { chatId } : { fileIds: selected }) }),
            });
            if (!res.ok || !res.body) {
                throw new Error(res.status === 429 ? 'You have used all your tokens for this period, or are sending too fast.' : 'Something went wrong. Please try again.');
            }
            id = res.headers.get('X-Chat-Id') ?? id;

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                setPendingAnswer((p) => p + decoder.decode(value, { stream: true }));
            }
        } catch (err) {
            setInput(question);
            toast({ title: 'Could not send message', description: err instanceof Error ? err.message : 'Please try again.', variant: 'destructive' });
        } finally {
            if (id) {
                await utils.getChatMessages.invalidate({ chatId: id });
                setChatId(id);
            }
            utils.listChats.invalidate();
            utils.getUsage.invalidate();
            setPendingQuestion(null);
            setPendingAnswer('');
            setSending(false);
        }
    };

    const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <main className='mx-auto flex h-[calc(100vh-3.5rem)] max-w-7xl flex-col gap-4 px-4 py-6 md:h-screen md:px-8 md:py-8 lg:flex-row'>
            {/* Documents and past chats */}
            <aside className='flex shrink-0 flex-col gap-4 lg:w-80'>
                <div>
                    <p className='text-sm font-medium text-green-700'>Ask AI</p>
                    <h1 className='mt-1 text-2xl font-bold tracking-tight text-zinc-900'>Chat across documents</h1>
                </div>

                <section className='rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-950/5'>
                    <div className='flex items-center justify-between'>
                        <h2 className='text-sm font-semibold text-zinc-900'>{chatId ? 'Documents in this chat' : 'Pick documents'}</h2>
                        {!chatId && ready.length > 1 && (
                            <button
                                onClick={() => setSelected(selected.length === Math.min(ready.length, 10) ? [] : ready.slice(0, 10).map((f) => f.id))}
                                className='text-xs font-medium text-green-700 hover:underline'>
                                {selected.length ? 'Clear' : 'Select all'}
                            </button>
                        )}
                    </div>
                    {chatId ? (
                        <ul className='mt-3 space-y-1.5'>
                            {activeIds.map((id) => (
                                <li key={id} className='flex items-center gap-2 text-sm text-zinc-700'>
                                    <FileText className='h-4 w-4 shrink-0 text-green-700' />
                                    <span className='truncate'>{nameOf(id)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : !ready.length ? (
                        <p className='mt-3 text-sm text-zinc-500'>
                            No ready documents yet. <Link href='/documents' className='text-green-700 underline'>Upload some</Link>.
                        </p>
                    ) : (
                        <ul className='mt-3 max-h-56 space-y-1 overflow-y-auto'>
                            {ready.map((f) => {
                                const on = selected.includes(f.id);
                                return (
                                    <li key={f.id}>
                                        <button
                                            onClick={() => toggle(f.id)}
                                            className={cn(
                                                'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition',
                                                on ? 'bg-green-50 text-green-900' : 'text-zinc-700 hover:bg-zinc-100'
                                            )}>
                                            <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded border', on ? 'border-green-600 bg-green-600 text-white' : 'border-zinc-300')}>
                                                {on && <Check className='h-3 w-3' />}
                                            </span>
                                            <span className='truncate'>{f.name}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <section className='flex min-h-0 flex-1 flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-950/5'>
                    <div className='flex items-center justify-between'>
                        <h2 className='text-sm font-semibold text-zinc-900'>Chats</h2>
                        <Button size='sm' variant='outline' onClick={newChat} className='h-8'>
                            <MessageSquarePlus className='mr-1.5 h-4 w-4' /> New
                        </Button>
                    </div>
                    {!chats?.length ? (
                        <p className='mt-3 text-sm text-zinc-500'>Your conversations will appear here.</p>
                    ) : (
                        <ul className='mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto'>
                            {chats.map((c) => (
                                <li key={c.id} className='group'>
                                    <div className={cn('flex items-center gap-1 rounded-lg pr-1 transition', c.id === chatId ? 'bg-green-50' : 'hover:bg-zinc-100')}>
                                        <button onClick={() => setChatId(c.id)} className='min-w-0 flex-1 px-2.5 py-2 text-left'>
                                            <p className='truncate text-sm font-medium text-zinc-800'>{c.title}</p>
                                            <p className='text-xs text-zinc-500'>
                                                {c.fileIds.length} doc{c.fileIds.length === 1 ? '' : 's'} · {formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}
                                            </p>
                                        </button>
                                        <button
                                            aria-label='Delete chat'
                                            onClick={() => {
                                                deleteChat({ chatId: c.id });
                                                if (c.id === chatId) newChat();
                                            }}
                                            className='rounded p-1.5 text-zinc-400 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100'>
                                            <Trash className='h-3.5 w-3.5' />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </aside>

            {/* Conversation */}
            <section className='relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-zinc-50 ring-1 ring-zinc-950/5'>
                <div className='flex-1 space-y-3 overflow-y-auto p-4 pb-28'>
                    {!messages.length && !pendingQuestion ? (
                        <div className='flex h-full flex-col items-center justify-center gap-3 px-6 text-center'>
                            <span className='flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-md'>
                                <Layers className='h-7 w-7' />
                            </span>
                            <h3 className='text-lg font-semibold'>{activeIds.length ? `Ask across ${activeIds.length} document${activeIds.length === 1 ? '' : 's'}` : 'Pick documents to start'}</h3>
                            <p className='max-w-sm text-sm text-zinc-500'>Answers cite the document and page they came from, so you can compare and cross-check.</p>
                            {activeIds.length > 1 && (
                                <Stagger onMount className='mt-2 flex max-w-lg flex-wrap justify-center gap-2' gap={0.06}>
                                    {STARTERS.map((s) => (
                                        <StaggerItem key={s}>
                                            <button
                                                onClick={() => send(s)}
                                                disabled={sending}
                                                className='rounded-full bg-white px-4 py-2 text-sm text-zinc-700 shadow-sm ring-1 ring-zinc-950/10 transition hover:bg-green-50 hover:ring-green-500/40 disabled:opacity-50'>
                                                {s}
                                            </button>
                                        </StaggerItem>
                                    ))}
                                </Stagger>
                            )}
                        </div>
                    ) : (
                        <>
                            {messages.map((m, i) => (
                                <Message
                                    key={m.id}
                                    text={m.text}
                                    isUser={m.isUserMessage}
                                    citations={false}
                                    saved={savedIds.has(m.id)}
                                    onSave={() => {
                                        setSavedIds((s) => new Set(s).add(m.id));
                                        saveAnswer({ question: messages[i - 1]?.isUserMessage ? messages[i - 1].text : '', answer: m.text });
                                    }}
                                />
                            ))}
                            {pendingQuestion && <Message text={pendingQuestion} isUser />}
                            {pendingQuestion && <Message text={pendingAnswer} isUser={false} isStreaming citations={false} />}
                        </>
                    )}
                    <div ref={endRef} />
                </div>

                <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-50 via-zinc-50 to-transparent p-4 pt-8'>
                    <div className='relative mx-auto max-w-3xl'>
                        <Textarea
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKey}
                            disabled={!chatId && !selected.length}
                            placeholder={!chatId && !selected.length ? 'Pick at least one document first' : 'Ask a question about the selected documents…'}
                            className='resize-none bg-white py-3 pr-12 text-base'
                        />
                        <Button
                            onClick={() => send()}
                            disabled={sending || !input.trim() || (!chatId && !selected.length)}
                            aria-label='Send message'
                            className='absolute bottom-1.5 right-2'>
                            {sending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Send className='h-4 w-4' />}
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default AskAi;
