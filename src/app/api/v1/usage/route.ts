import { apiGuard } from '@/lib/api-guard';
import { getUsageSummary } from '@/lib/usage';

export const GET = async (req: Request) => {
    const guard = await apiGuard(req);
    if (guard.response) return guard.response;
    const { userId, headers } = guard;

    const usage = await getUsageSummary(userId);
    return Response.json(
        {
            plan: usage.plan.name,
            period_end: usage.periodEnd,
            days_left: usage.daysLeft,
            tokens: { used: usage.tokensUsed, limit: usage.tokenLimit },
            documents: { used: usage.documentsUsed, limit: usage.documentLimit },
        },
        { headers }
    );
};
