import { z } from 'zod';
import { db } from '@/db';
import { getSessionUser } from '@/lib/auth';
import { PLANS, getPlanPriceId } from '@/config/plans';
import { billingEnabled, getStripe, siteUrl } from '@/lib/stripe';

const Body = z.object({ plan: z.enum(['pro', 'business']) });

export const POST = async (req: Request) => {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!billingEnabled()) return Response.json({ error: 'Billing is not configured yet' }, { status: 503 });

    const body = Body.safeParse(await req.json().catch(() => null));
    if (!body.success) return Response.json({ error: 'Choose a plan' }, { status: 400 });
    const priceId = getPlanPriceId(PLANS[body.data.plan]);
    if (!priceId) return Response.json({ error: 'That plan is not available yet' }, { status: 503 });

    const stripe = getStripe();
    const record = await db.user.findUniqueOrThrow({ where: { id: user.id } });

    let customerId = record.stripeCustomerId;
    if (!customerId) {
        const customer = await stripe.customers.create({ email: user.email, name: user.name, metadata: { userId: user.id } });
        customerId = customer.id;
        await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }

    // Already subscribed: changing plans happens in the billing portal, so we never double-bill.
    if (record.stripeSubscriptionId) {
        const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${siteUrl()}/billing` });
        return Response.json({ url: portal.url });
    }

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${siteUrl()}/billing?upgraded=1`,
        cancel_url: `${siteUrl()}/billing`,
        client_reference_id: user.id,
    });
    return Response.json({ url: session.url });
};
