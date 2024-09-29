'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from '@/components/ui/button';
import Dropzone from 'react-dropzone';
import { Cloud, File, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useUploadThing } from '@/lib/uploadthing';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/app/_trpc/client';
import { useRouter } from 'next/navigation';

const UploadDropzone = () => {
    const router = useRouter()
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { toast } = useToast();
    const { startUpload } = useUploadThing('pdfUploader')
    const { mutate: startPolling } = trpc.getFile.useMutation({
        onSuccess: (file) => {
            router.push(`/dashboard/${file.id}`)
        },
        retry: true,
        retryDelay: 500,
    })
    const startSimulatedProgress = () => {
        setUploadProgress(0)
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if ( prev >= 95) {
                    clearInterval(interval)
                    return prev
                }
                return prev + 5;
            })
        },  500)
        return interval
    }

    return (
        <Dropzone multiple={ false } onDrop={ async ( drop ) => {
            setIsUploading(true)
            const progressInterval = startSimulatedProgress();
            const res = await startUpload(drop);
            if ( !res ) {
                return(toast({
                    title: 'Something went wrong',
                    description: 'Please try again later',
                    variant: 'destructive'}
                ))
            }
            const [fileResponse] = res;
            const key = fileResponse?.key;
            if ( !key ) {
                return(toast({
                    title: 'Something went wrong',
                    description: 'Please try again later',
                    variant: 'destructive'}
                ))
            }

            clearInterval(progressInterval)
            setUploadProgress(100)
            startPolling({ key })
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
                                            <File className='h-4 w-4 text-green-500' />
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

function UploadButton() {
    const [ isOpen, setOpen ] = useState( false );

    return (
        <Dialog open={ isOpen } onOpenChange={ ( visible ) => setOpen( visible ) }>
            <DialogTrigger asChild>
                <Button>
                    Upload PDF
                </Button>
            </DialogTrigger>
            <DialogContent aria-description='upload pdf'>
                <DialogTitle>hello</DialogTitle>
                <UploadDropzone/>
            </DialogContent>
        </Dialog>
    )
}

export default UploadButton;
