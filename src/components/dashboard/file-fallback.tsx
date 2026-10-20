import Skeleton from '@/components/skeleton';

function FileFallback() {
    return(
        <div className='mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
            {
                [1,2,3].map((item) => (
                    <div key={item} className='flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-950/5'>
                        <div className='flex items-center gap-3'>
                            <div className='h-10 w-10 shrink-0 overflow-hidden rounded-xl'>
                                <Skeleton className='h-full w-full' />
                            </div>
                            <div className='flex-1 space-y-2'>
                                <Skeleton />
                                <Skeleton className='w-1/2' />
                            </div>
                        </div>
                        <Skeleton className='w-20 rounded-full' />
                    </div>
                ))
            }
        </div>
    )
}

export default FileFallback;
