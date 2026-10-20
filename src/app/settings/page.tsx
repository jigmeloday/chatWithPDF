import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import Settings from '@/components/settings/settings';

async function Page() {
    const user = await getSessionUser();
    if ( !user ) {
        redirect('/auth-callback?origin=settings')
    }
    return <Settings name={user.name} email={user.email} />
}

export default Page;
