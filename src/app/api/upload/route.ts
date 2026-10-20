import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { createDocument } from '@/lib/documents';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';

export const POST = async (req: NextRequest) => {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const limit = rateLimit(`upload:${user.id}`, 10);
    if (!limit.ok) return tooManyRequests(limit.retryAfter, true);

    const file = (await req.formData().catch(() => null))?.get('file');
    if (!(file instanceof File)) return Response.json({ error: 'No file provided' }, { status: 400 });

    const result = await createDocument(user.id, file);
    return result.ok ? Response.json({ id: result.id }) : Response.json({ error: result.error }, { status: result.status });
};
