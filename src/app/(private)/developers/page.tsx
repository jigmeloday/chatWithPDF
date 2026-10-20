import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import Developers from '@/components/developers/developers';

async function Page() {
    const user = await getSessionUser();
    if ( !user ) {
        redirect('/auth-callback?origin=developers')
    }
    return <Developers />
}

export default Page;
