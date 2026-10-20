import { API_RATE_LIMIT_PER_MINUTE, authenticateApiKey } from '@/lib/api-keys';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { db } from '@/db';
import { createDocument } from '@/lib/documents';

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

// multipart/form-data with a `file` field. Returns the new document id; poll GET /documents for its status.
export const POST = async (req: Request) => {
    const userId = await authenticateApiKey(req);
    if (!userId) return Response.json({ error: 'Invalid or missing API key' }, { status: 401 });

    const limit = rateLimit(`api:${userId}`, API_RATE_LIMIT_PER_MINUTE);
    if (!limit.ok) return tooManyRequests(limit.retryAfter, true);

    const file = (await req.formData().catch(() => null))?.get('file');
    if (!(file instanceof File)) return Response.json({ error: 'A PDF is required in the `file` field' }, { status: 400 });

    const result = await createDocument(userId, file);
    return result.ok
        ? Response.json({ id: result.id, status: 'PROCESSING' }, { status: 202 })
        : Response.json({ error: result.error }, { status: result.status });
};
