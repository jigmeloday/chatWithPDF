'use client';
import UploadButton from '@/components/upload-button';
import { trpc } from '@/app/_trpc/client';
import {
    Ghost,
    Loader2,
    MessageSquare,
    Plus,
    Trash,
} from 'lucide-react'
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import FileFallback from '@/components/dashboard/file-fallback';
import { Button } from '@/components/ui/button';

function Dashboard() {
    const [currentlyDeletingFile, setCurrentlyDeletingFile] =
        useState<string | null>(null)

    const utils = trpc.useContext()
    const { mutate: deleteFile } =
        trpc.deleteFile.useMutation({
            onSuccess: () => {
                utils.getUserFiles.invalidate()
            },
            onMutate({ id }) {
                setCurrentlyDeletingFile(id)
            },
            onSettled() {
                setCurrentlyDeletingFile(null)
            },
        })

    const { data:files, isLoading } = trpc.getUserFiles.useQuery();
    return(
        <main className='mx-auto max-w-7xl md:p-10'>
            <div className='mt-8 flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:items-center sm:gap-0'>
                <h1 className='font-bold mb-3 text-5xl text-gray-900'>My files</h1>
                <UploadButton />
            </div>
            {
                files?.length ? (
                    <div className='mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3'>
                        {
                            files?.map((item) => (
                                <div key={item.id} className='col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg'>
                                    <Link
                                        href={`/dashboard/${item.id}`}
                                        className='flex flex-col gap-2'>
                                        <div className='pt-6 px-6 flex w-full items-center justify-between space-x-6'>
                                            <div className='h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-green-500' />
                                            <div className='flex-1 truncate'>
                                                <div className='flex items-center space-x-3'>
                                                    <h3 className='truncate text-lg font-medium text-zinc-900'>
                                                        {item.name}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className='px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500'>
                                        <div className='flex items-center gap-2'>
                                            <Plus className='h-4 w-4' />
                                            {format(
                                                new Date(item.createdAt),
                                                'MMM yyyy'
                                            )}
                                        </div>

                                        <div className='flex items-center gap-2'>
                                            <MessageSquare className='h-4 w-4' />
                                            mocked
                                        </div>

                                        <Button
                                            onClick={() =>
                                                deleteFile({ id: item.id })
                                            }
                                            size='sm'
                                            className='w-full'
                                            variant='destructive'>
                                            {currentlyDeletingFile === item.id ? (
                                                <Loader2 className='h-4 w-4 animate-spin' />
                                            ) : (
                                                <Trash className='h-4 w-4' />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                ) : isLoading ?
                   <FileFallback />
                    :
                    <div className='mt-16 flex flex-col items-center gap-2 '>
                        <Ghost className='h-8 w-8 text-zinc-800' />
                        <h3 className='font-semibold text-xl'>No Data</h3>
                        <p>let&apos;s upload your first PDF</p>
                    </div>
            }
        </main>
    )
}

export default Dashboard;
