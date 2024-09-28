import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import Dashboard from '@/components/dashboard/dashboard';

async function Page() {
    const { getUser } = getKindeServerSession();
    const user = await getUser()
    if ( !user || !user.id ) {
        redirect('/auth-callback?origin-dashboard')
    }
    const dbUser = await db.user.findFirst({
        where: {
            id: user.id
        }
    })

    if ( !dbUser || !dbUser.id ) {
        redirect('/auth-callback?origin-dashboard')
    }
    return(
        <Dashboard/>
    )
}

export default Page;
