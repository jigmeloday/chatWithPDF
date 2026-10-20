'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Eraser, FileX, Loader2 } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { friendlyError } from '@/lib/errors';
import { ConfirmDialog, SettingsCard } from './ui';

export default function DataSection() {
    const { toast } = useToast();
    const router = useRouter();
    const utils = trpc.useContext();
    const [dialog, setDialog] = useState<'chats' | 'docs' | null>(null);
    const [exporting, setExporting] = useState(false);

    const downloadExport = async () => {
        setExporting(true);
        try {
            const res = await fetch('/api/account/export');
            if (!res.ok) throw new Error(res.status === 429 ? 'You can export up to 3 times an hour. Try again later.' : 'Could not prepare your export.');
            const url = URL.createObjectURL(await res.blob());
            const a = document.createElement('a');
            a.href = url;
            a.download = 'otterly-data-export.json';
            a.click();
            URL.revokeObjectURL(url);
            toast({ title: 'Export downloaded', description: 'Your data was saved as a JSON file.' });
        } catch (err) {
            toast({ title: 'Export failed', description: friendlyError(err), variant: 'destructive' });
        } finally {
            setExporting(false);
        }
    };

    const refresh = () => {
        utils.invalidate();
        router.refresh();
    };
    const { mutate: clearChats, isLoading: clearingChats } = trpc.deleteAllChats.useMutation({
        onSuccess: (r) => {
            setDialog(null);
            refresh();
            toast({ title: 'Chat history cleared', description: `${r.messages} messages removed.` });
        },
    });
    const { mutate: clearDocs, isLoading: clearingDocs } = trpc.deleteAllDocuments.useMutation({
        onSuccess: (r) => {
            setDialog(null);
            refresh();
            toast({ title: 'Documents deleted', description: `${r.deleted} document${r.deleted === 1 ? '' : 's'} removed.` });
        },
    });

    const Row = ({ icon: Icon, title, text, children }: { icon: typeof Download; title: string; text: string; children: React.ReactNode }) => (
        <li className='flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0'>
            <div className='flex items-start gap-3'>
                <span className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600'>
                    <Icon className='h-[18px] w-[18px]' />
                </span>
                <div>
                    <p className='font-medium text-zinc-900'>{title}</p>
                    <p className='max-w-md text-sm text-zinc-500'>{text}</p>
                </div>
            </div>
            {children}
        </li>
    );

    return (
        <>
            <SettingsCard title='Your data' description='Take your data with you, or clear parts of it without deleting your account.'>
                <ul className='divide-y divide-zinc-100'>
                    <Row icon={Download} title='Export my data' text='Download a JSON file with your profile, documents, chats, saved answers, API keys (names only) and webhooks.'>
                        <Button size='sm' variant='outline' disabled={exporting} onClick={downloadExport}>
                            {exporting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null} Download JSON
                        </Button>
                    </Row>
                    <Row icon={Eraser} title='Clear chat history' text='Deletes every conversation and question, in single-document chats and Ask AI. Your documents stay.'>
                        <Button size='sm' variant='outline' onClick={() => setDialog('chats')}>Clear history</Button>
                    </Row>
                    <Row icon={FileX} title='Delete all documents' text='Removes every uploaded PDF, its index, summaries and chats. This can’t be undone.'>
                        <Button size='sm' variant='outline' className='text-red-600 hover:bg-red-50 hover:text-red-700' onClick={() => setDialog('docs')}>Delete documents</Button>
                    </Row>
                </ul>
            </SettingsCard>

            <ConfirmDialog
                open={dialog === 'chats'}
                onClose={() => setDialog(null)}
                title='Clear all chat history?'
                description='Every conversation will be permanently deleted. Saved answers are kept.'
                confirmLabel='Clear history'
                loading={clearingChats}
                onConfirm={() => clearChats()}
            />
            <ConfirmDialog
                open={dialog === 'docs'}
                onClose={() => setDialog(null)}
                title='Delete all documents?'
                description='All your PDFs, their summaries and chat history will be permanently deleted.'
                confirmLabel='Delete everything'
                requireText='delete'
                loading={clearingDocs}
                onConfirm={() => clearDocs()}
            />
        </>
    );
}
