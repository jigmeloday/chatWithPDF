import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import Webhooks from '@/components/features/webhooks';

export const metadata = { title: 'Webhooks · Otterly' };

async function Page() {
    const user = await getSessionUser();
    if ( !user ) {
        redirect('/auth-callback?origin=webhooks')
    }
    return <Webhooks />
}

export default Page;
