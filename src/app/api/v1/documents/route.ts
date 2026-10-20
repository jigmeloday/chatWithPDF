import { authenticateApiKey } from '@/lib/api-keys';
import { db } from '@/db';

export const GET = async (req: Request) => {
    const userId = await authenticateApiKey(req);
    if (!userId) return Response.json({ error: 'Invalid or missing API key' }, { status: 401 });

    const files = await db.file.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, uploadStatus: true, createdAt: true },
    });
    return Response.json({
        data: files.map(({ uploadStatus, ...f }) => ({ ...f, status: uploadStatus })),
    });
};
