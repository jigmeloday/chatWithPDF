import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import AuthForm from '@/components/auth/auth-form';
import { getSessionUser } from '@/lib/auth';

async function Page() {
    if (await getSessionUser()) redirect('/dashboard');

    return (
        <Suspense>
            <AuthForm mode='sign-up' />
        </Suspense>
    );
}

export default Page;
