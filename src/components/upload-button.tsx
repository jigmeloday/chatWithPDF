'use client';
import { ReactNode, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from '@/components/ui/button';
import Dropzone from 'react-dropzone';
import { Cloud, File as FileIcon, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { friendlyError } from '@/lib/errors';
import { trpc } from '@/app/_trpc/client';
import { useRouter } from 'next/navigation';

const MAX_SIZE = 4 * 1024 * 1024;

// fetch has no upload progress events, so use XHR.
const uploadPdf = (file: File, onProgress: (pct: number) => void) =>
    new Promise<{ id: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload');
        xhr.upload.onprogress = (e) => e.lengthComputable && onProgress((e.loaded / e.total) * 100);
        xhr.onload = () => {
            const body = JSON.parse(xhr.responseText || '{}');
            xhr.status >= 200 && xhr.status < 300 ? resolve(body) : reject(new Error(body.error ?? 'Upload failed'));
        };
        xhr.onerror = () => reject(new Error('Network error'));
        const form = new FormData();
        form.append('file', file);
        xhr.send(form);
    });

const UploadDropzone = () => {
    const router = useRouter()
    const utils = trpc.useContext()
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { toast } = useToast();

    const fail = (description: string) =>
        toast({ title: 'Upload failed', description, variant: 'destructive' })

    return (
        <Dropzone
            multiple={ false }
            accept={ { 'application/pdf': ['.pdf'] } }
            maxSize={ MAX_SIZE }
            disabled={ isUploading }
            onDropRejected={ () => fail('Please choose a PDF that is 4MB or smaller.') }
            onDrop={ async ( drop ) => {
                if ( !drop[ 0 ] ) return
                setIsUploading(true)
                setUploadProgress(0)
                try {
                    const { id } = await uploadPdf(drop[ 0 ], setUploadProgress)
                    utils.getUserFiles.invalidate()
                    utils.getUsage.invalidate()
                    utils.getActivity.invalidate()
                    toast({ title: 'Upload complete', description: 'We’re processing your PDF. This usually takes a few seconds.' })
                    router.push(`/dashboard/${id}`)
                } catch ( err ) {
                    fail(friendlyError(err, 'Please try again later'))
                    setIsUploading(false)
                }
            }}>
            { ( { getRootProps, getInputProps, acceptedFiles } ) => (
                <div  { ...getRootProps() } className='border h-64 m-4 border-dashed border-gray-300 rounded-lg'>
                    <div className='flex items-center justify-center h-full w-full'>
                        <label
                            className='flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 '
                            htmlFor='dropzone-file'>
                            <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                                <Cloud className='h-6 w-6 text-zinc-500 mb-2'/>
                                <p className='text-zinc-500 mb-2 text-sm'>
                                    <span className='font-semibold text-green-500'>Click to upload </span>
                                    or drag and drop
                                </p>
                                <p className='text-sm text-zinc-500'>PDF(up to 4MB)</p>
                            </div>
                            {
                                acceptedFiles && acceptedFiles[ 0 ] ? (
                                    <div
                                        className='max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200'>
                                        <div className='px-3 py-2 h-full grid place-item-center'>
                                            <FileIcon className='h-4 w-4 text-green-500' />
                                        </div>
                                        <div className='px-3 py-2 h-full text-sm truncate'>
                                            {acceptedFiles[0].name}
                                        </div>
                                    </div>
                                ) : null}
                            {
                                isUploading? (
                                    <div className='w-full mt-4 max-w-xs mx-auto'>
                                        <Progress className='h-1 w-full' value={uploadProgress} />
                                        {
                                            uploadProgress === 100 ?
                                                <div className='flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2'>
                                                    <Loader2 className='h-3 w-3 animate-spin' />
                                                </div> : null
                                        }
                                    </div>
                                ) : null }
                            <input {...getInputProps()} type='file' id='dropzone-file' className='hidden' />
                        </label>
                    </div>
                </div>
            ) }
        </Dropzone>
    )
}

function UploadButton({ trigger }: { trigger?: ReactNode }) {
    const [ isOpen, setOpen ] = useState( false );

    return (
        <Dialog open={ isOpen } onOpenChange={ ( visible ) => setOpen( visible ) }>
            <DialogTrigger asChild>
                {trigger ?? <Button>Upload PDF</Button>}
            </DialogTrigger>
            <DialogContent aria-description='upload pdf'>
                <DialogTitle>Upload a PDF</DialogTitle>
                <UploadDropzone/>
            </DialogContent>
        </Dialog>
    )
}

export default UploadButton;
