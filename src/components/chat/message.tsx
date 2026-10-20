import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, Check, Copy } from 'lucide-react'
import { linkCitations } from '@/lib/citations'
import { cn } from '@/lib/utils'

interface MessageProps {
    text: string
    isUser: boolean
    isStreaming?: boolean
    /** Turn "(p. 3)" into links that jump the PDF viewer. Only meaningful next to a viewer. */
    citations?: boolean
    onSave?: () => void
    saved?: boolean
}

function Message({ text, isUser, isStreaming, citations = true, onSave, saved }: MessageProps) {
    const [copied, setCopied] = useState(false)

    const copy = async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return(
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            style={{ originX: isUser ? 1 : 0 }}
            className={cn('group flex items-end gap-1.5', isUser ? 'justify-end' : 'justify-start')}>
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
                    <ReactMarkdown
                        className='prose prose-sm max-w-none prose-p:my-1.5 prose-pre:my-2'
                        components={{
                            a: ({ href, children }) => {
                                const page = href?.match(/^#page-(\d+)$/)?.[1]
                                return page ? (
                                    <button
                                        type='button'
                                        onClick={() => window.dispatchEvent(new CustomEvent('pdf:goto', { detail: Number(page) }))}
                                        className='font-medium text-green-700 underline decoration-dotted hover:text-green-900'>
                                        {children}
                                    </button>
                                ) : (
                                    <a href={href} target='_blank' rel='noopener noreferrer'>{children}</a>
                                )
                            },
                        }}>
                        {citations ? linkCitations(text) : text}
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
            {!isUser && text && !isStreaming && (
                <div className='mb-1 flex flex-col gap-0.5 opacity-0 transition group-hover:opacity-100'>
                    <button
                        onClick={copy}
                        aria-label='Copy answer'
                        className='rounded-md p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700'>
                        {copied ? <Check className='h-3.5 w-3.5' /> : <Copy className='h-3.5 w-3.5' />}
                    </button>
                    {onSave && (
                        <button
                            onClick={onSave}
                            disabled={saved}
                            aria-label={saved ? 'Saved' : 'Save answer'}
                            className='rounded-md p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-green-700 disabled:text-green-600'>
                            {saved ? <BookmarkCheck className='h-3.5 w-3.5' /> : <Bookmark className='h-3.5 w-3.5' />}
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    )
}

export default Message;
