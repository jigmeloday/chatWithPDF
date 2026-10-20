import { addMonths, differenceInCalendarDays, subMonths } from 'date-fns';
import { db } from '@/db';
import { PLANS, Plan } from '@/config/plans';

export interface UsageSummary {
    plan: Plan;
    periodStart: string;
    periodEnd: string;
    daysLeft: number;
    tokensUsed: number;
    tokenLimit: number;
    documentsUsed: number;
    documentLimit: number;
    messagesSent: number;
}

// Pro runs on the Stripe billing period; Free renews monthly from the signup date.
const getBillingPeriod = (user: { createdAt: Date; stripePriceId: string | null; stripeCurrentPeriodEnd: Date | null }) => {
    const now = new Date();
    const end = user.stripeCurrentPeriodEnd;

    if (user.stripePriceId && end && end > now) {
        return { plan: PLANS.pro, start: subMonths(end, 1), end };
    }

    let start = user.createdAt;
    while (addMonths(start, 1) <= now) start = addMonths(start, 1);
    return { plan: PLANS.free, start, end: addMonths(start, 1) };
};

export const getUsageSummary = async (userId: string): Promise<UsageSummary> => {
    const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
    const { plan, start, end } = getBillingPeriod(user);

    const [tokens, documentsUsed, messagesSent] = await Promise.all([
        db.message.aggregate({
            _sum: { inputTokens: true, outputTokens: true },
            where: { userId, createdAt: { gte: start } },
        }),
        db.file.count({ where: { userId } }),
        db.message.count({ where: { userId, isUserMessage: true, createdAt: { gte: start } } }),
    ]);

    return {
        plan,
        periodStart: start.toISOString(),
        periodEnd: end.toISOString(),
        daysLeft: Math.max(0, differenceInCalendarDays(end, new Date())),
        tokensUsed: (tokens._sum.inputTokens ?? 0) + (tokens._sum.outputTokens ?? 0),
        tokenLimit: plan.tokensPerMonth,
        documentsUsed,
        documentLimit: plan.maxDocuments,
        messagesSent,
    };
};

export interface DailyTokens {
    date: string;
    tokens: number;
}

// Tokens per UTC day for the last `days` days, zero-filled.
export const getDailyTokens = async (userId: string, days = 7): Promise<DailyTokens[]> => {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const rows = await db.$queryRaw<{ day: string; tokens: number }[]>`
        select to_char("createdAt" at time zone 'UTC', 'YYYY-MM-DD') as day,
               coalesce(sum("inputTokens" + "outputTokens"), 0)::int as tokens
        from "Message"
        where "userId" = ${userId} and "createdAt" >= ${since}
        group by 1`;
    const byDay = new Map(rows.map((r) => [r.day, r.tokens]));

    return Array.from({ length: days }, (_, i) => {
        const d = new Date(since);
        d.setUTCDate(since.getUTCDate() + i);
        const date = d.toISOString().slice(0, 10);
        return { date, tokens: byDay.get(date) ?? 0 };
    });
};

export const getApiSummary = async (userId: string) => {
    const keys = await db.apiKey.findMany({
        where: { userId, revokedAt: null },
        select: { requestCount: true, lastUsedAt: true },
    });
    const lastUsed = keys.map((k) => k.lastUsedAt).filter((d): d is Date => !!d).sort((a, b) => +b - +a)[0];
    return {
        activeKeys: keys.length,
        totalRequests: keys.reduce((sum, k) => sum + k.requestCount, 0),
        lastUsedAt: lastUsed?.toISOString() ?? null,
    };
};

export interface ActivityItem {
    id: string;
    type: 'upload' | 'question' | 'api-key';
    label: string;
    at: string;
}

export const getActivity = async (userId: string, limit = 6): Promise<ActivityItem[]> => {
    const [files, messages, keys] = await Promise.all([
        db.file.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit, select: { id: true, name: true, createdAt: true } }),
        db.message.findMany({
            where: { userId, isUserMessage: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: { id: true, text: true, createdAt: true, File: { select: { name: true } } },
        }),
        db.apiKey.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit, select: { id: true, name: true, createdAt: true } }),
    ]);

    return [
        ...files.map((f) => ({ id: `f${f.id}`, type: 'upload' as const, label: `Uploaded ${f.name}`, at: f.createdAt })),
        ...messages.map((m) => ({
            id: `m${m.id}`,
            type: 'question' as const,
            label: `Asked about ${m.File?.name ?? 'a document'}`,
            at: m.createdAt,
        })),
        ...keys.map((k) => ({ id: `k${k.id}`, type: 'api-key' as const, label: `Created API key "${k.name}"`, at: k.createdAt })),
    ]
        .sort((a, b) => +b.at - +a.at)
        .slice(0, limit)
        .map((i) => ({ ...i, at: i.at.toISOString() }));
};
