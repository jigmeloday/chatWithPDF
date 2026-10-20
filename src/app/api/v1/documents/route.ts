import { API_RATE_LIMIT_PER_MINUTE, authenticateApiKey } from '@/lib/api-keys';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { db } from '@/db';

export const GET = async (req: Request) => {
    const userId = await authenticateApiKey(req);
    if (!userId) return Response.json({ error: 'Invalid or missing API key' }, { status: 401 });

    const limit = rateLimit(`api:${userId}`, API_RATE_LIMIT_PER_MINUTE);
    if (!limit.ok) return tooManyRequests(limit.retryAfter, true);

    const files = await db.file.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, uploadStatus: true, createdAt: true },
    });
    return Response.json({
        data: files.map(({ uploadStatus, ...f }) => ({ ...f, status: uploadStatus })),
    });
};
