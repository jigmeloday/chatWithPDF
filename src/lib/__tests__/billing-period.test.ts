import { describe, expect, it, vi } from 'vitest';

vi.mock('@/db', () => ({ db: {} }));

import { getBillingPeriod } from '../usage';

const now = new Date('2026-10-20T12:00:00Z');

describe('getBillingPeriod', () => {
    it('uses the Stripe period for active Pro users', () => {
        const end = new Date('2026-11-05T00:00:00Z');
        const p = getBillingPeriod({ createdAt: new Date('2026-01-01'), stripePriceId: 'price_1', stripeCurrentPeriodEnd: end }, now);
        expect(p.plan.slug).toBe('pro');
        expect(p.end).toEqual(end);
    });

    it('falls back to Free when the Pro period has ended', () => {
        const p = getBillingPeriod(
            { createdAt: new Date('2026-01-15T00:00:00Z'), stripePriceId: 'price_1', stripeCurrentPeriodEnd: new Date('2026-09-01') },
            now
        );
        expect(p.plan.slug).toBe('free');
    });

    it('renews Free users monthly from their signup date', () => {
        const p = getBillingPeriod({ createdAt: new Date('2026-08-15T00:00:00Z'), stripePriceId: null, stripeCurrentPeriodEnd: null }, now);
        expect(p.start.toISOString()).toBe('2026-10-15T00:00:00.000Z');
        expect(p.end.toISOString()).toBe('2026-11-15T00:00:00.000Z');
    });
});

describe('plan from Stripe price id', () => {
    it('maps the Business price to the Business plan', () => {
        process.env.STRIPE_BUSINESS_PRICE_ID = 'price_biz';
        const p = getBillingPeriod(
            { createdAt: new Date('2026-01-01'), stripePriceId: 'price_biz', stripeCurrentPeriodEnd: new Date('2026-11-05T00:00:00Z') },
            now
        );
        expect(p.plan.slug).toBe('business');
        delete process.env.STRIPE_BUSINESS_PRICE_ID;
    });
});
