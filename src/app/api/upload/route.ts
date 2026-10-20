import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { db } from '@/db';
import { getSessionUser } from '@/lib/auth';
import { processDocument } from '@/lib/process-document';
import { storage } from '@/lib/storage';
import { getUsageSummary } from '@/lib/usage';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';

const MAX_SIZE = 4 * 1024 * 1024;

export const POST = async (req: NextRequest) => {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const limit = rateLimit(`upload:${user.id}`, 10);
    if (!limit.ok) return tooManyRequests(limit.retryAfter, true);

    const usage = await getUsageSummary(user.id);
    if (usage.documentsUsed >= usage.documentLimit)
        return Response.json(
            { error: `${usage.plan.name} plan allows up to ${usage.documentLimit} documents` },
            { status: 403 }
        );

    const file = (await req.formData().catch(() => null))?.get('file');
    if (!(file instanceof File)) return Response.json({ error: 'No file provided' }, { status: 400 });
    if (file.size > MAX_SIZE) return Response.json({ error: 'PDF must be 4MB or smaller' }, { status: 413 });

    const data = Buffer.from(await file.arrayBuffer());
    if (data.subarray(0, 5).toString() !== '%PDF-')
        return Response.json({ error: 'Only PDF files are supported' }, { status: 415 });

    const id = randomUUID();
    const key = `${id}.pdf`;
    await storage.save(key, data);

    const created = await db.file.create({
        data: {
            id,
            key,
            name: file.name,
            userId: user.id,
            url: `/api/files/${id}/content`,
            uploadStatus: 'PROCESSING',
        },
    });

    // Runs after the response is sent; the dashboard shows the status as it changes.
    void processDocument(created.id, key);

    return Response.json({ id: created.id });
};
