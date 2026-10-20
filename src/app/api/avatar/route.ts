import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { storage } from '@/lib/storage';
import { db } from '@/db';

const MAX_BYTES = 1024 * 1024;

const isImage = (b: Buffer) =>
    b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
    (b[0] === 0xff && b[1] === 0xd8) ||
    (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP');

export const POST = async (req: NextRequest) => {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const limit = rateLimit(`avatar:${user.id}`, 10);
    if (!limit.ok) return tooManyRequests(limit.retryAfter, true);

    const file = (await req.formData().catch(() => null))?.get('file');
    if (!(file instanceof File)) return Response.json({ error: 'No image provided' }, { status: 400 });
    if (file.size > MAX_BYTES) return Response.json({ error: 'Image must be 1MB or smaller' }, { status: 413 });

    const data = Buffer.from(await file.arrayBuffer());
    if (!isImage(data)) return Response.json({ error: 'Use a PNG, JPEG or WebP image' }, { status: 415 });

    await storage.save(`avatar_${user.id}`, data);
    const image = `/api/avatar/${user.id}?v=${Date.now()}`;
    await db.user.update({ where: { id: user.id }, data: { image } });
    return Response.json({ image });
};

export const DELETE = async () => {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    await storage.remove(`avatar_${user.id}`);
    await db.user.update({ where: { id: user.id }, data: { image: null } });
    return new Response(null, { status: 204 });
};
