import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import AskAi from '@/components/features/ask';

export const metadata = { title: 'AskAi · Otterly' };

async function Page() {
    const user = await getSessionUser();
    if ( !user ) {
        redirect('/auth-callback?origin=ask')
    }
    return <AskAi />
}

export default Page;
