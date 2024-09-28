import Skeleton from '@/components/skeleton';

function FileFallback() {
    return(
        <div className='mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3'>
            {
                [1,2,3].map((item) => (
                    <div key={item} className='col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg'>
                        <div className='pt-6 px-6 flex w-full items-center justify-between space-x-6'>
                          <div className='flex items-center justify-center w-10 h-10 rounded-full border overflow-hidden'>
                              <Skeleton className='h-full w-full flex-shrink-0' />
                          </div>
                            <div className='flex-1 truncate'>
                                <div className='flex items-center space-x-3'>
                                    <Skeleton />
                                </div>
                            </div>
                        </div>
                        <div className='px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500'>
                            <Skeleton />
                            <Skeleton />
                            <Skeleton />
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default FileFallback;
