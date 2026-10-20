'use client'
import { useContext, useEffect, useRef } from 'react'
import { Eraser, Loader2, Sparkles } from 'lucide-react'
import { trpc } from '@/app/_trpc/client'
import Message from './message'
import { Stagger, StaggerItem } from '@/components/motion'
import { ChatContext } from './chat-context'

const SUGGESTIONS = [
    'Summarize this document',
    'What are the key points?',
    'List any important dates, names or numbers',
]

function Messages({ fileId }: { fileId: string }) {
    const { data: messages, isLoading } = trpc.getMessages.useQuery({ fileId })
    const { data: insights } = trpc.getFileInsights.useQuery({ fileId })
    const { pendingQuestion, pendingAnswer, addMessage, isLoading: isSending } = useContext(ChatContext)
    const endRef = useRef<HTMLDivElement>(null)
    const utils = trpc.useContext()
    const { mutate: clear, isLoading: clearing } = trpc.clearMessages.useMutation({
        onSuccess: () => utils.getMessages.invalidate({ fileId }),
    })

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages?.length, pendingQuestion, pendingAnswer])

    if ( isLoading )
        return (
            <div className='flex flex-1 items-center justify-center'>
                <Loader2 className='h-6 w-6 animate-spin text-green-600' />
            </div>
        )

    if ( !messages?.length && !pendingQuestion ) {
        const questions = insights?.suggestions.length ? insights.suggestions : SUGGESTIONS
        return (
            <div className='flex flex-1 flex-col justify-center gap-4 overflow-y-auto px-5 py-6'>
                {insights?.summary && (
                    <div className='rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-zinc-950/5'>
                        <p className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-green-700'>
                            <Sparkles className='h-3.5 w-3.5' /> Summary
                            {insights.usedOcr && (
                                <span className='ml-auto rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-amber-700 ring-1 ring-amber-600/20'>
                                    Scanned, read with OCR
                                </span>
                            )}
                        </p>
                        <p className='mt-2 text-zinc-700'>{insights.summary}</p>
                        {!!insights.keyPoints.length && (
                            <ul className='mt-3 list-disc space-y-1 pl-5 text-zinc-600'>
                                {insights.keyPoints.map((k) => (
                                    <li key={k}>{k}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                <div className='text-center'>
                    <h3 className='text-base font-semibold'>Ask your first question</h3>
                    <p className='mt-1 text-sm text-zinc-500'>Try one of these, or type your own.</p>
                </div>
                <Stagger className='flex flex-col gap-2' gap={0.06}>
                    {questions.map((q) => (
                        <StaggerItem key={q}>
                            <button
                                disabled={isSending}
                                onClick={() => addMessage(q)}
                                className='w-full rounded-full bg-white px-4 py-2 text-left text-sm text-zinc-700 shadow-sm ring-1 ring-zinc-950/10 transition hover:bg-green-50 hover:ring-green-500/40 disabled:opacity-50'>
                                {q}
                            </button>
                        </StaggerItem>
                    ))}
                </Stagger>
            </div>
        )
    }

    return(
        <div className='flex max-h-[calc(100vh-3.5rem-7rem)] flex-1 flex-col gap-3 overflow-y-auto p-4 md:max-h-[calc(100vh-7rem)]'>
            {!!messages?.length && !pendingQuestion && (
                <button
                    disabled={clearing}
                    onClick={() => confirm('Clear this conversation?') && clear({ fileId })}
                    className='ml-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800'>
                    <Eraser className='h-3.5 w-3.5' /> Clear chat
                </button>
            )}
            {messages?.map((m) => (
                <Message key={m.id} text={m.text} isUser={m.isUserMessage} />
            ))}
            {pendingQuestion && <Message text={pendingQuestion} isUser />}
            {pendingQuestion && <Message text={pendingAnswer} isUser={false} isStreaming />}
            <div ref={endRef} />
        </div>
    )
}

export default Messages;
