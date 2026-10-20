import { db } from '@/db';
import { getSessionUser } from '@/lib/auth';
import { billingEnabled, getStripe, siteUrl } from '@/lib/stripe';

export const POST = async () => {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!billingEnabled()) return Response.json({ error: 'Billing is not configured yet' }, { status: 503 });

    const record = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    if (!record.stripeCustomerId) return Response.json({ error: 'No billing account yet' }, { status: 400 });

    const session = await getStripe().billingPortal.sessions.create({
        customer: record.stripeCustomerId,
        return_url: `${siteUrl()}/settings`,
    });
    return Response.json({ url: session.url });
};
