import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import Settings from '@/components/settings/settings';

export const metadata = { title: 'Settings · Otterly' };

async function Page() {
    const user = await getSessionUser();
    if ( !user ) {
        redirect('/auth-callback?origin=settings')
    }
    return (
        <Settings
            user={{
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image ?? null,
                emailVerified: user.emailVerified,
                createdAt: new Date(user.createdAt).toISOString(),
            }}
        />
    )
}

export default Page;
