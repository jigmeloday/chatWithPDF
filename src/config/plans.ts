export type PlanSlug = 'free' | 'pro';

export interface Plan {
    slug: PlanSlug;
    name: string;
    price: number;
    tokensPerMonth: number;
    maxDocuments: number;
    tagline: string;
    features: string[];
}

export const PLANS: Record<PlanSlug, Plan> = {
    free: {
        slug: 'free',
        name: 'Free',
        price: 0,
        tokensPerMonth: 50_000,
        maxDocuments: 3,
        tagline: 'Try DocuChatty on a few documents.',
        features: ['50,000 tokens per month', 'Up to 3 documents', '4MB per PDF', 'API access'],
    },
    pro: {
        slug: 'pro',
        name: 'Pro',
        price: 15,
        tokensPerMonth: 2_000_000,
        maxDocuments: 50,
        tagline: 'For people who live in their documents.',
        features: ['2,000,000 tokens per month', 'Up to 50 documents', '4MB per PDF', 'API access', 'Priority processing'],
    },
};
