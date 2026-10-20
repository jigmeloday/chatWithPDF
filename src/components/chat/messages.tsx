'use client'
import { useContext, useEffect, useRef } from 'react'
import { Eraser, Loader2, MessageSquare } from 'lucide-react'
import { trpc } from '@/app/_trpc/client'
import Message from './message'
import { ChatContext } from './chat-context'

const SUGGESTIONS = [
    'Summarize this document',
    'What are the key points?',
    'List any important dates, names or numbers',
]

function Messages({ fileId }: { fileId: string }) {
    const { data: messages, isLoading } = trpc.getMessages.useQuery({ fileId })
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

    if ( !messages?.length && !pendingQuestion )
        return (
            <div className='flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center'>
                <span className='flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700'>
                    <MessageSquare className='h-6 w-6' />
                </span>
                <h3 className='text-lg font-semibold'>Ask your first question</h3>
                <p className='text-sm text-zinc-500'>Your PDF is ready. Ask anything about it.</p>
                <div className='mt-3 flex flex-col gap-2'>
                    {SUGGESTIONS.map((q) => (
                        <button
                            key={q}
                            disabled={isSending}
                            onClick={() => addMessage(q)}
                            className='rounded-full bg-white px-4 py-2 text-sm text-zinc-700 shadow-sm ring-1 ring-zinc-950/10 transition hover:bg-green-50 hover:ring-green-500/40 disabled:opacity-50'>
                            {q}
                        </button>
                    ))}
                </div>
            </div>
        )

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
