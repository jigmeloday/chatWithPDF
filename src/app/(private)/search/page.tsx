import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import Search from '@/components/features/search';

export const metadata = { title: 'Search · Otterly' };

async function Page() {
    const user = await getSessionUser();
    if ( !user ) {
        redirect('/auth-callback?origin=search')
    }
    return <Search />
}

export default Page;
