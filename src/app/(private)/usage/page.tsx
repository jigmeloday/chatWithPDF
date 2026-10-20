import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import UsageAnalytics from '@/components/features/usage';

export const metadata = { title: 'UsageAnalytics · Otterly' };

async function Page() {
    const user = await getSessionUser();
    if ( !user ) {
        redirect('/auth-callback?origin=usage')
    }
    return <UsageAnalytics />
}

export default Page;
