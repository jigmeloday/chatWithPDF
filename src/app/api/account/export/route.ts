import { db } from '@/db';
import { getSessionUser } from '@/lib/auth';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';

// Everything we hold about the signed-in user, as a JSON download. Secrets and file contents are left out.
export const GET = async () => {
    const user = await getSessionUser();
    if (!user) return new Response('Unauthorized', { status: 401 });
    const limit = rateLimit(`export:${user.id}`, 3, 3_600_000);
    if (!limit.ok) return tooManyRequests(limit.retryAfter);

    const userId = user.id;
    const [profile, documents, chats, messages, saved, apiKeys, webhooks] = await Promise.all([
        db.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, emailVerified: true, createdAt: true, answerStyle: true, answerLanguage: true, notifyDocReady: true, notifyDocFailed: true },
        }),
        db.file.findMany({ where: { userId }, select: { id: true, name: true, uploadStatus: true, usedOcr: true, summary: true, keyPoints: true, createdAt: true } }),
        db.chat.findMany({ where: { userId }, select: { id: true, title: true, fileIds: true, createdAt: true } }),
        db.message.findMany({ where: { userId }, orderBy: { createdAt: 'asc' }, select: { id: true, fileId: true, chatId: true, isUserMessage: true, text: true, source: true, inputTokens: true, outputTokens: true, createdAt: true } }),
        db.savedAnswer.findMany({ where: { userId }, select: { id: true, fileName: true, question: true, answer: true, note: true, createdAt: true } }),
        db.apiKey.findMany({ where: { userId }, select: { name: true, prefix: true, createdAt: true, lastUsedAt: true, revokedAt: true, requestCount: true } }),
        db.webhookEndpoint.findMany({ where: { userId }, select: { url: true, events: true, active: true, createdAt: true } }),
    ]);

    const body = JSON.stringify({ exportedAt: new Date().toISOString(), profile, documents, chats, messages, savedAnswers: saved, apiKeys, webhooks }, null, 2);
    return new Response(body, {
        headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="otterly-data-export.json"',
            'Cache-Control': 'no-store',
        },
    });
};
