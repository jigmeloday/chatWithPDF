import { db } from '@/db';
import { apiGuard } from '@/lib/api-guard';
import { storage } from '@/lib/storage';

type Ctx = { params: { id: string } };

export const GET = async (req: Request, { params }: Ctx) => {
    const guard = await apiGuard(req);
    if (guard.response) return guard.response;
    const { userId, headers } = guard;

    const file = await db.file.findFirst({ where: { id: params.id, userId } });
    if (!file) return Response.json({ error: 'Document not found' }, { status: 404, headers });

    const [chunks, messages] = await Promise.all([
        db.documentChunk.count({ where: { fileId: file.id } }),
        db.message.count({ where: { fileId: file.id, userId } }),
    ]);
    return Response.json(
        { id: file.id, name: file.name, status: file.uploadStatus, error: file.failureReason, createdAt: file.createdAt, passages: chunks, messages },
        { headers }
    );
};

export const DELETE = async (req: Request, { params }: Ctx) => {
    const guard = await apiGuard(req);
    if (guard.response) return guard.response;
    const { userId, headers } = guard;

    const file = await db.file.findFirst({ where: { id: params.id, userId } });
    if (!file) return Response.json({ error: 'Document not found' }, { status: 404, headers });

    await db.file.delete({ where: { id: file.id } });
    await storage.remove(file.key);
    return new Response(null, { status: 204, headers });
};
