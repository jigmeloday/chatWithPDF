import { authenticateApiKey } from '@/lib/api-keys';
import { getUsageSummary } from '@/lib/usage';

export const GET = async (req: Request) => {
    const userId = await authenticateApiKey(req);
    if (!userId) return Response.json({ error: 'Invalid or missing API key' }, { status: 401 });

    const usage = await getUsageSummary(userId);
    return Response.json({
        plan: usage.plan.name,
        period_end: usage.periodEnd,
        days_left: usage.daysLeft,
        tokens: { used: usage.tokensUsed, limit: usage.tokenLimit },
        documents: { used: usage.documentsUsed, limit: usage.documentLimit },
    });
};
