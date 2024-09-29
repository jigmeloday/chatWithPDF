import { ChangeEvent, createContext, useState } from 'react';
import { ChatProviderProps, StreamResponse } from '@/components/model/components.model';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from 'react-query';

export const ChatContext = createContext<StreamResponse>({
    addMessage: ()=> {},
    handleInputChange: () => {},
    message: '',
    isLoading: false
})

export const ChatContextProvider = ({ fileId, children }: ChatProviderProps) => {
    const [message, setMessage] = useState('');
    const { toast } = useToast();
    const [loading, setLoading] = useState(false)

    const { mutate: sendMessage } = useMutation({
        mutationFn: async ({ message }: { message: string }) => {
            const response = await fetch('/api/message', {
                method: 'POST',
                body: JSON.stringify({
                    fileId,
                    message
                })
            })
            if ( !response.ok ) {
                throw new Error("Fail to send message")
            }
            return response.body
        }
    })

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }
    const addMessage = () => sendMessage({ message })
    return(
        <ChatContext.Provider value={
            addMessage,
            message,
            handleInputChange,
            isLoading
        }>
            {children}
        </ChatContext.Provider>
    )
}
