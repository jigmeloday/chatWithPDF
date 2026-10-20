import { db } from '@/db';
import { apiGuard } from '@/lib/api-guard';

type Ctx = { params: { id: string } };

const owned = (userId: string, id: string) => db.file.findFirst({ where: { id, userId }, select: { id: true } });

// The stored conversation for a document, oldest first.
export const GET = async (req: Request, { params }: Ctx) => {
    const guard = await apiGuard(req);
    if (guard.response) return guard.response;
    const { userId, headers } = guard;
    if (!(await owned(userId, params.id))) return Response.json({ error: 'Document not found' }, { status: 404, headers });

    const messages = await db.message.findMany({
        where: { fileId: params.id, userId },
        orderBy: { createdAt: 'asc' },
        take: 200,
        select: { id: true, text: true, isUserMessage: true, source: true, createdAt: true },
    });
    return Response.json(
        { data: messages.map((m) => ({ id: m.id, role: m.isUserMessage ? 'user' : 'assistant', content: m.text, via: m.source, createdAt: m.createdAt })) },
        { headers }
    );
};

// Clears the conversation, so the next question starts fresh.
export const DELETE = async (req: Request, { params }: Ctx) => {
    const guard = await apiGuard(req);
    if (guard.response) return guard.response;
    const { userId, headers } = guard;
    if (!(await owned(userId, params.id))) return Response.json({ error: 'Document not found' }, { status: 404, headers });

    await db.message.deleteMany({ where: { fileId: params.id, userId } });
    return new Response(null, { status: 204, headers });
};
