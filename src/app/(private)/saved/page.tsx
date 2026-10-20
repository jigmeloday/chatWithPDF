import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import Saved from '@/components/features/saved';

export const metadata = { title: 'Saved · Otterly' };

async function Page() {
    const user = await getSessionUser();
    if ( !user ) {
        redirect('/auth-callback?origin=saved')
    }
    return <Saved />
}

export default Page;
