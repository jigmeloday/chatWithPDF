export type PlanSlug = 'free' | 'pro';

export interface Plan {
    slug: PlanSlug;
    name: string;
    price: number;
    tokensPerMonth: number;
    maxDocuments: number;
}

export const PLANS: Record<PlanSlug, Plan> = {
    free: { slug: 'free', name: 'Free', price: 0, tokensPerMonth: 50_000, maxDocuments: 3 },
    pro: { slug: 'pro', name: 'Pro', price: 15, tokensPerMonth: 2_000_000, maxDocuments: 50 },
};
