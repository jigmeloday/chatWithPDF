'use client'
import { useContext, useEffect, useRef } from 'react'
import { Loader2, MessageSquare } from 'lucide-react'
import { trpc } from '@/app/_trpc/client'
import Message from './message'
import { ChatContext } from './chat-context'

function Messages({ fileId }: { fileId: string }) {
    const { data: messages, isLoading } = trpc.getMessages.useQuery({ fileId })
    const { pendingQuestion, pendingAnswer } = useContext(ChatContext)
    const endRef = useRef<HTMLDivElement>(null)

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
            </div>
        )

    return(
        <div className='flex max-h-[calc(100vh-3.5rem-7rem)] flex-1 flex-col gap-3 overflow-y-auto p-4 md:max-h-[calc(100vh-7rem)]'>
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
