import Stripe from 'stripe';
import { getStripe, syncSubscription } from '@/lib/stripe';

export const POST = async (req: Request) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers.get('stripe-signature');
    if (!secret || !process.env.STRIPE_SECRET_KEY) return new Response('Billing is not configured', { status: 503 });
    if (!signature) return new Response('Missing signature', { status: 400 });

    const stripe = getStripe();
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
    } catch {
        return new Response('Invalid signature', { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                if (session.mode === 'subscription' && session.subscription) {
                    const id = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
                    await syncSubscription(await stripe.subscriptions.retrieve(id));
                }
                break;
            }
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                await syncSubscription(event.data.object as Stripe.Subscription);
                break;
        }
    } catch (err) {
        console.error('Stripe webhook failed:', err);
        return new Response('Webhook handler failed', { status: 500 }); // Stripe retries
    }
    return new Response('ok');
};
