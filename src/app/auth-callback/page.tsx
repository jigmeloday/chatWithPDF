'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '../_trpc/client';
import { Loader2 } from 'lucide-react';

function Page() {
    const route = useRouter();
    const searchParam = useSearchParams().get('origin');
    trpc.authCallback.useQuery(undefined, {
        onSuccess: ({success}) => {
            if ( success ) {
                route.push(searchParam ? `/${searchParam}` : '/dashboard' )
            }
        },
        onError: ({error}) => {
            if ( error.data.code === 'UNAUTHORIZED' ) {
                route.push('/sign-in')
            }
        },
        retry: true,
        retryDelay: 500,
    })
    return(
        <div className='w-full mt-24 flex justify-center'>
            <div className='flex flex-col items-center gap-2'>
                <Loader2 className='h-8 w-8 animate-spin text-green-800' />
                <h3 className='font-semibold text-xl'>Setting up your account...</h3>
                <p className='font-semibold text-xl'>You will be redirected automatically.</p>
            </div>
        </div>
    )
}

export default Page;
