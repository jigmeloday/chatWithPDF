import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { getSessionUser } from '@/lib/auth';
import { answerAcross } from '@/lib/chat';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { getUsageSummary } from '@/lib/usage';

const Body = z.object({
    message: z.string().trim().min(1).max(4000),
    chatId: z.string().optional(),
    fileIds: z.array(z.string()).min(1).max(10).optional(),
});

// Multi-document chat. Streams the answer as plain text; the chat id comes back in the X-Chat-Id header.
export const POST = async (req: NextRequest) => {
    const user = await getSessionUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    const limit = rateLimit(`chat:${user.id}`, 20);
    if (!limit.ok) return tooManyRequests(limit.retryAfter);

    const body = Body.safeParse(await req.json().catch(() => null));
    if (!body.success) return new Response('Invalid request', { status: 400 });

    const usage = await getUsageSummary(user.id);
    if (usage.tokensUsed >= usage.tokenLimit) return new Response('Token limit reached for this billing period', { status: 429 });

    let chat = body.data.chatId ? await db.chat.findFirst({ where: { id: body.data.chatId, userId: user.id } }) : null;
    if (body.data.chatId && !chat) return new Response('Chat not found', { status: 404 });

    if (!chat) {
        const ids = Array.from(new Set(body.data.fileIds ?? []));
        if (!ids.length) return new Response('Select at least one document', { status: 400 });

        const ready = await db.file.findMany({ where: { id: { in: ids }, userId: user.id, uploadStatus: 'SUCCESS' }, select: { id: true } });
        if (ready.length !== ids.length) return new Response('Some documents are missing or not ready', { status: 400 });

        chat = await db.chat.create({
            data: { userId: user.id, fileIds: ids, title: body.data.message.slice(0, 60) },
        });
    }

    const { id: chatId, fileIds } = chat;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            try {
                await answerAcross({
                    userId: user.id,
                    chatId,
                    fileIds,
                    message: body.data.message,
                    onText: (c) => controller.enqueue(encoder.encode(c)),
                });
                controller.close();
            } catch (err) {
                console.error('Ask failed:', err);
                controller.error(err);
            }
        },
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Chat-Id': chatId } });
};
