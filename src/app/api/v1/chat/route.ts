import { z } from 'zod';
import { API_RATE_LIMIT_PER_MINUTE, authenticateApiKey } from '@/lib/api-keys';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { getUsageSummary } from '@/lib/usage';
import { db } from '@/db';
import { answerQuestion } from '@/lib/chat';

const Body = z.object({ document_id: z.string(), message: z.string().min(1) });

export const POST = async (req: Request) => {
    const userId = await authenticateApiKey(req);
    if (!userId) return Response.json({ error: 'Invalid or missing API key' }, { status: 401 });

    const limit = rateLimit(`api:${userId}`, API_RATE_LIMIT_PER_MINUTE);
    if (!limit.ok) return tooManyRequests(limit.retryAfter, true);

    const body = Body.safeParse(await req.json().catch(() => null));
    if (!body.success) return Response.json({ error: 'document_id and message are required' }, { status: 400 });

    const file = await db.file.findFirst({ where: { id: body.data.document_id, userId } });
    if (!file) return Response.json({ error: 'Document not found' }, { status: 404 });

    const usage = await getUsageSummary(userId);
    if (usage.tokensUsed >= usage.tokenLimit)
        return Response.json({ error: 'Token limit reached for this billing period' }, { status: 429 });

    if (file.uploadStatus !== 'SUCCESS')
        return Response.json({ error: 'Document is not ready yet' }, { status: 409 });

    try {
        const { text, usage: used } = await answerQuestion({
            userId,
            fileId: file.id,
            message: body.data.message,
            source: 'api',
        });
        return Response.json({
            answer: text,
            usage: { input_tokens: used.inputTokens, output_tokens: used.outputTokens },
        });
    } catch (err) {
        console.error('API chat failed:', err);
        return Response.json({ error: 'Failed to generate an answer' }, { status: 502 });
    }
};
