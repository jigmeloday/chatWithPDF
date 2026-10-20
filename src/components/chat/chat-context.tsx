'use client'
import { ChangeEvent, createContext, useState } from 'react';
import { ChatProviderProps, StreamResponse } from '@/components/model/components.model';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/app/_trpc/client';

export const ChatContext = createContext<StreamResponse>({
    addMessage: () => {},
    handleInputChange: () => {},
    message: '',
    isLoading: false,
    pendingQuestion: null,
    pendingAnswer: '',
})

export const ChatContextProvider = ({ fileId, children }: ChatProviderProps) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
    const [pendingAnswer, setPendingAnswer] = useState('');
    const { toast } = useToast();
    const utils = trpc.useContext();

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }

    const addMessage = async () => {
        const question = message.trim()
        if ( !question || isLoading ) return

        setMessage('')
        setPendingQuestion(question)
        setPendingAnswer('')
        setIsLoading(true)

        try {
            const response = await fetch('/api/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId, message: question }),
            })
            if ( !response.ok || !response.body ) {
                throw new Error(response.status === 429
                    ? 'You have used all your tokens for this period.'
                    : 'Something went wrong. Please try again.')
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            for (;;) {
                const { done, value } = await reader.read()
                if ( done ) break
                setPendingAnswer((prev) => prev + decoder.decode(value, { stream: true }))
            }
        } catch ( err ) {
            setMessage(question)
            toast({
                title: 'Could not send message',
                description: err instanceof Error ? err.message : 'Please try again.',
                variant: 'destructive',
            })
        } finally {
            // Saved messages now include this exchange; drop the temporary ones afterwards.
            await utils.getMessages.invalidate({ fileId })
            utils.getUsage.invalidate()
            utils.getDailyTokens.invalidate()
            setPendingQuestion(null)
            setPendingAnswer('')
            setIsLoading(false)
        }
    }

    return(
        <ChatContext.Provider value={{
            addMessage,
            message,
            handleInputChange,
            isLoading,
            pendingQuestion,
            pendingAnswer,
        }}>
            {children}
        </ChatContext.Provider>
    )
}
