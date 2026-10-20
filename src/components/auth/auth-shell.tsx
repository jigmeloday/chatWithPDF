import { PropsWithChildren } from 'react';
import { Stagger, StaggerItem } from '@/components/motion';
import { FileText, MessageCircle, Sparkles } from 'lucide-react';

const HIGHLIGHTS = [
    { icon: FileText, text: 'Upload any PDF in seconds' },
    { icon: MessageCircle, text: 'Ask questions in plain language' },
    { icon: Sparkles, text: 'Get answers grounded in your document' },
];

// Split layout shared by all auth pages: brand panel on the left, content on the right.
function AuthShell({ children }: PropsWithChildren) {
    return (
        <div className='grid flex-1 lg:grid-cols-2'>
            <aside className='hidden flex-col justify-center gap-8 bg-gradient-to-br from-green-600 to-green-900 px-16 text-white lg:flex'>
                <div>
                    <h2 className='text-4xl font-bold leading-tight'>
                        Chat with your documents.
                    </h2>
                    <p className='mt-3 max-w-md text-green-100'>
                        Otterly turns any PDF into a conversation, so you find what
                        you need without scrolling through pages.
                    </p>
                </div>
                <Stagger as='ul' onMount delay={0.2} className='flex flex-col gap-4'>
                    {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                        <StaggerItem as='li' key={text} className='flex items-center gap-3'>
                            <span className='flex h-9 w-9 items-center justify-center rounded-lg bg-white/15'>
                                <Icon className='h-5 w-5' />
                            </span>
                            {text}
                        </StaggerItem>
                    ))}
                </Stagger>
            </aside>

            <main className='flex items-center justify-center px-4 py-12'>{children}</main>
        </div>
    );
}

export default AuthShell;
