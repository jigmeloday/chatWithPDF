export type PlanSlug = 'free' | 'pro' | 'business';

export interface Plan {
    slug: PlanSlug;
    name: string;
    price: number;
    tokensPerMonth: number;
    maxDocuments: number;
    maxPagesPerDocument: number;
    tagline: string;
    features: string[];
    /** Env var holding this plan's Stripe price id (paid plans only). */
    priceEnv?: string;
}

export const PLANS: Record<PlanSlug, Plan> = {
    free: {
        slug: 'free',
        name: 'Free',
        price: 0,
        tokensPerMonth: 50_000,
        maxDocuments: 3,
        maxPagesPerDocument: 30,
        tagline: 'Try Otterly on a few documents.',
        features: ['50,000 tokens per month', 'Up to 3 documents', 'Up to 30 pages per PDF', '4MB per PDF', 'API access'],
    },
    pro: {
        slug: 'pro',
        name: 'Pro',
        price: 15,
        tokensPerMonth: 2_000_000,
        maxDocuments: 50,
        maxPagesPerDocument: 300,
        tagline: 'For people who live in their documents.',
        features: ['2,000,000 tokens per month', 'Up to 50 documents', 'Up to 300 pages per PDF', '4MB per PDF', 'API access'],
        priceEnv: 'STRIPE_PRO_PRICE_ID',
    },
    business: {
        slug: 'business',
        name: 'Business',
        price: 49,
        tokensPerMonth: 10_000_000,
        maxDocuments: 250,
        maxPagesPerDocument: 1000,
        tagline: 'For teams and heavy API use.',
        features: ['10,000,000 tokens per month', 'Up to 250 documents', 'Up to 1,000 pages per PDF', '4MB per PDF', 'API access', 'Priority support'],
        priceEnv: 'STRIPE_BUSINESS_PRICE_ID',
    },
};

// Free → Pro → Business, in display order.
export const PLAN_ORDER: PlanSlug[] = ['free', 'pro', 'business'];

export const getPlanPriceId = (plan: Plan) => (plan.priceEnv ? process.env[plan.priceEnv] : undefined);

export const planForPriceId = (priceId: string | null) =>
    priceId ? PLAN_ORDER.map((s) => PLANS[s]).find((p) => getPlanPriceId(p) === priceId) : undefined;

export const nextPlan = (slug: PlanSlug) => PLANS[PLAN_ORDER[PLAN_ORDER.indexOf(slug) + 1]];
