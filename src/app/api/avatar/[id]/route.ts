import { storage } from '@/lib/storage';

const sniff = (b: Buffer) =>
    b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ? 'image/png'
    : b[0] === 0xff && b[1] === 0xd8 ? 'image/jpeg'
    : b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP' ? 'image/webp'
    : null;

// Profile pictures are public by URL (they show next to a name), keyed by user id.
export const GET = async (_req: Request, { params }: { params: { id: string } }) => {
    if (!/^[\w-]{8,64}$/.test(params.id)) return new Response('Not found', { status: 404 });
    const data = await storage.read(`avatar_${params.id}`).catch(() => null);
    const type = data && sniff(data);
    if (!data || !type) return new Response('Not found', { status: 404 });

    return new Response(new Uint8Array(data), { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=3600' } });
};
