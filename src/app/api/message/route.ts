import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { SendMessageValidator } from '@/lib/validator/send-message-validator';
import { db } from '@/db';
import { getUsageSummary } from '@/lib/usage';
import { answerQuestion } from '@/lib/chat';

// Streams the answer as plain text.
export const POST = async (req: NextRequest) => {
    const user = await getSessionUser();
    if ( !user ) return new Response('Unauthorized', { status: 401 })
    const userId = user.id

    const body = SendMessageValidator.safeParse(await req.json().catch(() => null))
    if ( !body.success ) return new Response('Invalid request', { status: 400 })
    const { message, fileId } = body.data

    const file = await db.file.findFirst({ where: { id: fileId, userId } })
    if ( !file ) return new Response('Not found', { status: 404 })
    if ( file.uploadStatus !== 'SUCCESS' ) return new Response('Document is not ready yet', { status: 409 })

    const usage = await getUsageSummary(userId)
    if ( usage.tokensUsed >= usage.tokenLimit )
        return new Response('Token limit reached for this billing period', { status: 429 })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
        async start(controller) {
            try {
                await answerQuestion({
                    userId,
                    fileId,
                    message,
                    source: 'app',
                    onText: (chunk) => controller.enqueue(encoder.encode(chunk)),
                })
            } catch ( err ) {
                console.error('Chat failed:', err)
                controller.error(err)
                return
            }
            controller.close()
        },
    })

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
