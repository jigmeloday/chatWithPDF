import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getUsageSummary } from '@/lib/usage';
import BillingView from '@/components/billing/billing-view';

export const metadata = { title: 'Billing · Otterly' };

async function Page() {
    const user = await getSessionUser();
    if ( !user ) {
        redirect('/auth-callback?origin=billing')
    }
    return <BillingView usage={await getUsageSummary(user.id)} />
}

export default Page;
