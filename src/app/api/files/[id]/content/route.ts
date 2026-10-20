import { db } from '@/db';
import { getSessionUser } from '@/lib/auth';
import { storage } from '@/lib/storage';

export const GET = async (_req: Request, { params }: { params: { id: string } }) => {
    const user = await getSessionUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    const file = await db.file.findFirst({ where: { id: params.id, userId: user.id } });
    if (!file) return new Response('Not found', { status: 404 });

    const data = await storage.read(file.key).catch(() => null);
    if (!data) return new Response('Not found', { status: 404 });

    return new Response(new Uint8Array(data), {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline',
            'Cache-Control': 'private, max-age=3600',
        },
    });
};
