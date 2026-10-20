import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import Overview from '@/components/dashboard/overview';

async function Page() {
    const user = await getSessionUser()
    if ( !user ) {
        redirect('/auth-callback?origin=dashboard')
    }
    const dbUser = await db.user.findFirst({
        where: {
            id: user.id
        }
    })

    if ( !dbUser || !dbUser.id ) {
        redirect('/auth-callback?origin=dashboard')
    }
    return(
        <Overview name={user.name} />
    )
}

export default Page;
