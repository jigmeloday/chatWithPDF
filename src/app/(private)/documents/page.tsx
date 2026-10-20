import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import Documents from '@/components/dashboard/documents';

async function Page() {
    const user = await getSessionUser();
    if ( !user ) {
        redirect('/auth-callback?origin=documents')
    }
    return <Documents />
}

export default Page;
