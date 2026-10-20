import Stripe from 'stripe';
import { db } from '@/db';
import { PLAN_ORDER, PLANS, getPlanPriceId } from '@/config/plans';

export const billingEnabled = () =>
    !!process.env.STRIPE_SECRET_KEY && PLAN_ORDER.some((s) => !!getPlanPriceId(PLANS[s]));

let client: Stripe | undefined;
export const getStripe = () => (client ??= new Stripe(process.env.STRIPE_SECRET_KEY!));

export const siteUrl = () => process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';

// Newer Stripe API versions keep the period on the subscription item.
const periodEnd = (sub: Stripe.Subscription) => {
    const seconds =
        (sub.items.data[0] as unknown as { current_period_end?: number })?.current_period_end ??
        (sub as unknown as { current_period_end?: number }).current_period_end;
    return seconds ? new Date(seconds * 1000) : null;
};

// Mirrors a Stripe subscription onto the user. Only active/trialing counts as Pro.
export const syncSubscription = async (sub: Stripe.Subscription) => {
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
    const active = sub.status === 'active' || sub.status === 'trialing';

    await db.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
            stripeSubscriptionId: active ? sub.id : null,
            stripePriceId: active ? sub.items.data[0]?.price.id ?? null : null,
            stripeCurrentPeriodEnd: periodEnd(sub),
        },
    });
};
