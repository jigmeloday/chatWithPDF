import { db } from '@/db';
import { apiGuard } from '@/lib/api-guard';
import { createDocument } from '@/lib/documents';

export const GET = async (req: Request) => {
    const guard = await apiGuard(req);
    if (guard.response) return guard.response;
    const { userId, headers } = guard;

    const files = await db.file.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, uploadStatus: true, failureReason: true, createdAt: true },
    });
    return Response.json(
        { data: files.map(({ uploadStatus, failureReason, ...f }) => ({ ...f, status: uploadStatus, error: failureReason })) },
        { headers }
    );
};

// multipart/form-data with a `file` field. Returns the new document id; poll GET /documents/{id} for its status.
export const POST = async (req: Request) => {
    const guard = await apiGuard(req);
    if (guard.response) return guard.response;
    const { userId, headers } = guard;

    const file = (await req.formData().catch(() => null))?.get('file');
    if (!(file instanceof File))
        return Response.json({ error: 'A PDF is required in the `file` field' }, { status: 400, headers });

    const result = await createDocument(userId, file);
    return result.ok
        ? Response.json({ id: result.id, status: 'PROCESSING' }, { status: 202, headers })
        : Response.json({ error: result.error }, { status: result.status, headers });
};
