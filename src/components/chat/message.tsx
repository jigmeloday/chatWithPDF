import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface MessageProps {
    text: string
    isUser: boolean
    isStreaming?: boolean
}

function Message({ text, isUser, isStreaming }: MessageProps) {
    return(
        <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
            <div
                className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                    isUser
                        ? 'rounded-br-sm bg-green-600 text-white'
                        : 'rounded-bl-sm bg-white text-zinc-800 ring-1 ring-zinc-950/5'
                )}>
                {isUser ? (
                    <p className='whitespace-pre-wrap'>{text}</p>
                ) : text ? (
                    <ReactMarkdown className='prose prose-sm max-w-none prose-p:my-1.5 prose-pre:my-2'>
                        {text}
                    </ReactMarkdown>
                ) : null}
                {isStreaming && !text && (
                    <span className='flex gap-1 py-1'>
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className='h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400'
                                style={{ animationDelay: `${i * 120}ms` }}
                            />
                        ))}
                    </span>
                )}
            </div>
        </div>
    )
}

export default Message;
