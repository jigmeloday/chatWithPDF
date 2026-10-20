import { randomUUID } from 'crypto';
import { db } from '@/db';
import { processDocument } from '@/lib/process-document';
import { storage } from '@/lib/storage';
import { getUsageSummary } from '@/lib/usage';

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

type Result = { ok: true; id: string } | { ok: false; status: number; error: string };

// Validates, stores and starts processing an uploaded PDF. Shared by the app and the public API.
export const createDocument = async (userId: string, file: File): Promise<Result> => {
    const usage = await getUsageSummary(userId);
    if (usage.documentsUsed >= usage.documentLimit)
        return { ok: false, status: 403, error: `${usage.plan.name} plan allows up to ${usage.documentLimit} documents` };
    if (file.size > MAX_UPLOAD_BYTES) return { ok: false, status: 413, error: 'PDF must be 4MB or smaller' };

    const data = Buffer.from(await file.arrayBuffer());
    if (data.subarray(0, 5).toString() !== '%PDF-') return { ok: false, status: 415, error: 'Only PDF files are supported' };

    const id = randomUUID();
    const key = `${id}.pdf`;
    await storage.save(key, data);
    await db.file.create({
        data: { id, key, name: file.name, userId, url: `/api/files/${id}/content`, uploadStatus: 'PROCESSING' },
    });

    // Runs after the response is sent; the status updates as processing finishes.
    void processDocument(id, key);
    return { ok: true, id };
};
