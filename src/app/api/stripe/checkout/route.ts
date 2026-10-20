import { db } from '@/db';
import { getSessionUser } from '@/lib/auth';
import { billingEnabled, getStripe, siteUrl } from '@/lib/stripe';

export const POST = async () => {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!billingEnabled()) return Response.json({ error: 'Billing is not configured yet' }, { status: 503 });

    const stripe = getStripe();
    const record = await db.user.findUniqueOrThrow({ where: { id: user.id } });

    let customerId = record.stripeCustomerId;
    if (!customerId) {
        const customer = await stripe.customers.create({ email: user.email, name: user.name, metadata: { userId: user.id } });
        customerId = customer.id;
        await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
        success_url: `${siteUrl()}/dashboard?upgraded=1`,
        cancel_url: `${siteUrl()}/pricing`,
        client_reference_id: user.id,
    });
    return Response.json({ url: session.url });
};
