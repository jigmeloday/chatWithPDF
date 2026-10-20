'use client';
import { useState } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowUpRight, FileText, Loader2, MoreHorizontal, Pencil, RotateCw, Trash } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export const STATUS_STYLES: Record<string, { label: string; pill: string; dot: string }> = {
    SUCCESS: { label: 'Ready', pill: 'bg-green-50 text-green-700 ring-green-600/20', dot: 'bg-green-500' },
    PROCESSING: { label: 'Processing', pill: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500 animate-pulse' },
    PENDING: { label: 'Pending', pill: 'bg-zinc-100 text-zinc-600 ring-zinc-500/20', dot: 'bg-zinc-400' },
    FAILED: { label: 'Failed', pill: 'bg-red-50 text-red-700 ring-red-600/20', dot: 'bg-red-500' },
};

export interface FileCardData {
    id: string;
    name: string;
    createdAt: string | Date;
    uploadStatus: string;
    usedOcr?: boolean;
}

interface FileCardProps {
    file: FileCardData;
    view?: 'grid' | 'list';
}

function FileCard({ file, view = 'grid' }: FileCardProps) {
    const [confirming, setConfirming] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [newName, setNewName] = useState(file.name);
    const utils = trpc.useContext();
    const { mutate: deleteFile, isLoading: isDeleting } = trpc.deleteFile.useMutation({
        onSuccess: () => {
            utils.getUserFiles.invalidate();
            utils.getUsage.invalidate();
            utils.getActivity.invalidate();
            setConfirming(false);
        },
    });
    const { mutate: renameFile, isLoading: isRenaming } = trpc.renameFile.useMutation({
        onSuccess: () => {
            utils.getUserFiles.invalidate();
            setRenaming(false);
        },
    });
    const { mutate: retryFile } = trpc.retryFile.useMutation({
        onSuccess: () => utils.getUserFiles.invalidate(),
    });
    const status = STATUS_STYLES[file.uploadStatus] ?? STATUS_STYLES.PENDING;
    const created = new Date(file.createdAt);

    const pill = (
        <span
            className={cn(
                'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                status.pill
            )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
            {status.label}
        </span>
    );
    const icon = (
        <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-sm'>
            <FileText className='h-5 w-5' />
        </span>
    );
    const deleteButton = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    aria-label={`Actions for ${file.name}`}
                    size='icon'
                    variant='ghost'
                    className='h-8 w-8 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'>
                    <MoreHorizontal className='h-4 w-4' />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                <DropdownMenuItem onSelect={() => { setNewName(file.name); setRenaming(true); }} className='cursor-pointer'>
                    <Pencil className='mr-2 h-4 w-4' /> Rename
                </DropdownMenuItem>
                {file.uploadStatus === 'FAILED' && (
                    <DropdownMenuItem onSelect={() => retryFile({ id: file.id })} className='cursor-pointer'>
                        <RotateCw className='mr-2 h-4 w-4' /> Retry processing
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => setConfirming(true)} className='cursor-pointer text-red-600 focus:text-red-600'>
                    <Trash className='mr-2 h-4 w-4' /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <motion.li
            layout
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94 }}
            whileHover={view === 'grid' ? { y: -3 } : undefined}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className='group relative rounded-2xl bg-white shadow-sm ring-1 ring-zinc-950/5 hover:shadow-md hover:ring-green-500/40'>
            {view === 'grid' ? (
                <>
                    <Link href={`/dashboard/${file.id}`} className='flex flex-col gap-5 p-5'>
                        <div className='flex items-start gap-3 pr-8'>
                            {icon}
                            <div className='min-w-0'>
                                <h3 className='truncate font-medium text-zinc-900' title={file.name}>{file.name}</h3>
                                <p className='text-xs text-zinc-500'>
                                    {formatDistanceToNow(created, { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center justify-between'>
                            <span className='flex items-center gap-1.5'>
                                {pill}
                                {file.usedOcr && <span title='Scanned PDF read with OCR' className='rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600'>OCR</span>}
                            </span>
                            <span className='flex items-center gap-1 text-sm font-medium text-green-700 opacity-0 transition group-hover:opacity-100'>
                                Open <ArrowUpRight className='h-4 w-4' />
                            </span>
                        </div>
                    </Link>
                    <div className='absolute right-3 top-3'>{deleteButton}</div>
                </>
            ) : (
                <div className='flex items-center gap-4 p-4'>
                    <Link href={`/dashboard/${file.id}`} className='flex min-w-0 flex-1 items-center gap-4'>
                        {icon}
                        <div className='min-w-0 flex-1'>
                            <h3 className='truncate font-medium text-zinc-900' title={file.name}>{file.name}</h3>
                            <p className='text-xs text-zinc-500'>Added {format(created, 'MMM d, yyyy')}</p>
                        </div>
                        <div className='hidden sm:block'>{pill}</div>
                    </Link>
                    {deleteButton}
                </div>
            )}

            <Dialog open={renaming} onOpenChange={setRenaming}>
                <DialogContent>
                    <DialogTitle>Rename document</DialogTitle>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            renameFile({ id: file.id, name: newName });
                        }}
                        className='flex flex-col gap-4'>
                        <Input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={120} required autoFocus />
                        <DialogFooter className='gap-2'>
                            <Button type='button' variant='outline' onClick={() => setRenaming(false)}>Cancel</Button>
                            <Button type='submit' disabled={isRenaming}>
                                {isRenaming && <Loader2 className='mr-2 h-4 w-4 animate-spin' />} Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={confirming} onOpenChange={setConfirming}>
                <DialogContent>
                    <DialogTitle>Delete this document?</DialogTitle>
                    <DialogDescription>
                        &ldquo;{file.name}&rdquo; and its chat history will be permanently removed. This can&apos;t be undone.
                    </DialogDescription>
                    <DialogFooter className='gap-2'>
                        <Button variant='outline' onClick={() => setConfirming(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant='destructive'
                            disabled={isDeleting}
                            onClick={() => deleteFile({ id: file.id })}>
                            {isDeleting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.li>
    );
}

export default FileCard;
