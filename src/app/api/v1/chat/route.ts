import { z } from 'zod';
import { apiGuard } from '@/lib/api-guard';
import { getUsageSummary } from '@/lib/usage';
import { db } from '@/db';
import { answerQuestion } from '@/lib/chat';

const Body = z.object({
    document_id: z.string(),
    message: z.string().trim().min(1).max(4000),
    stream: z.boolean().default(false),
    history: z.boolean().default(true),
    store: z.boolean().default(true),
    max_sources: z.number().int().min(1).max(10).default(5),
    instructions: z.string().trim().max(500).optional(),
});

const result = (r: { text: string; usage: { inputTokens: number; outputTokens: number }; sources: unknown[] }) => ({
    answer: r.text,
    sources: r.sources,
    usage: {
        input_tokens: r.usage.inputTokens,
        output_tokens: r.usage.outputTokens,
        total_tokens: r.usage.inputTokens + r.usage.outputTokens,
    },
});

export const POST = async (req: Request) => {
    const guard = await apiGuard(req);
    if (guard.response) return guard.response;
    const { userId, headers } = guard;

    const body = Body.safeParse(await req.json().catch(() => null));
    if (!body.success)
        return Response.json({ error: 'Invalid request', details: body.error.flatten().fieldErrors }, { status: 400, headers });
    const o = body.data;

    const file = await db.file.findFirst({ where: { id: o.document_id, userId } });
    if (!file) return Response.json({ error: 'Document not found' }, { status: 404, headers });
    if (file.uploadStatus !== 'SUCCESS') return Response.json({ error: 'Document is not ready yet' }, { status: 409, headers });

    const usage = await getUsageSummary(userId);
    if (usage.tokensUsed >= usage.tokenLimit)
        return Response.json({ error: 'Token limit reached for this billing period' }, { status: 429, headers });

    const options = {
        userId,
        fileId: file.id,
        message: o.message,
        source: 'api' as const,
        useHistory: o.history,
        store: o.store,
        maxSources: o.max_sources,
        instructions: o.instructions,
    };

    if (!o.stream) {
        try {
            return Response.json(result(await answerQuestion(options)), { headers });
        } catch (err) {
            console.error('API chat failed:', err);
            return Response.json({ error: 'Failed to generate an answer' }, { status: 502, headers });
        }
    }

    // Server-sent events: `delta` events as text is written, then one `done` event with the full result.
    const encoder = new TextEncoder();
    const send = (c: ReadableStreamDefaultController, event: string, data: unknown) =>
        c.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const r = await answerQuestion({ ...options, onText: (text) => send(controller, 'delta', { text }) });
                send(controller, 'done', result(r));
            } catch (err) {
                console.error('API chat stream failed:', err);
                send(controller, 'error', { error: 'Failed to generate an answer' });
            }
            controller.close();
        },
    });
    return new Response(stream, {
        headers: { ...headers, 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' },
    });
};
