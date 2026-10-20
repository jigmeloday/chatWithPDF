'use client';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '../_trpc/client';
import { Loader2 } from 'lucide-react';

const MAX_RETRIES = 5;

// Only allow same-site relative paths like "dashboard" or "dashboard/abc".
const isSafeOrigin = (origin: string | null): origin is string =>
    !!origin && /^[\w-]+(\/[\w-]+)*$/.test(origin);

function AuthCallback() {
    const router = useRouter();
    const origin = useSearchParams().get('origin');

    trpc.authCallback.useQuery(undefined, {
        onSuccess: ({ success }) => {
            if (success) {
                router.push(isSafeOrigin(origin) ? `/${origin}` : '/dashboard');
            }
        },
        onError: (err) => {
            if (err.data?.code === 'UNAUTHORIZED') {
                router.push('/sign-in');
            }
        },
        retry: (failureCount, err) =>
            err.data?.code !== 'UNAUTHORIZED' && failureCount < MAX_RETRIES,
        retryDelay: 500,
    });

    return (
        <div className='w-full mt-24 flex justify-center'>
            <div className='flex flex-col items-center gap-2'>
                <Loader2 className='h-8 w-8 animate-spin text-green-800' />
                <h3 className='font-semibold text-xl'>Setting up your account...</h3>
                <p className='font-semibold text-xl'>You will be redirected automatically.</p>
            </div>
        </div>
    );
}

function Page() {
    return (
        <Suspense>
            <AuthCallback />
        </Suspense>
    );
}

export default Page;
