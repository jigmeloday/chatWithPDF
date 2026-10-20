import { API_RATE_LIMIT_PER_MINUTE, authenticateApiKey } from '@/lib/api-keys';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { getUsageSummary } from '@/lib/usage';

export const GET = async (req: Request) => {
    const userId = await authenticateApiKey(req);
    if (!userId) return Response.json({ error: 'Invalid or missing API key' }, { status: 401 });

    const limit = rateLimit(`api:${userId}`, API_RATE_LIMIT_PER_MINUTE);
    if (!limit.ok) return tooManyRequests(limit.retryAfter, true);

    const usage = await getUsageSummary(userId);
    return Response.json({
        plan: usage.plan.name,
        period_end: usage.periodEnd,
        days_left: usage.daysLeft,
        tokens: { used: usage.tokensUsed, limit: usage.tokenLimit },
        documents: { used: usage.documentsUsed, limit: usage.documentLimit },
    });
};
