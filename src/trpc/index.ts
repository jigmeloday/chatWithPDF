import { getSessionUser } from '@/lib/auth'
import {
    privateProcedure,
    publicProcedure,
    router,
} from './trpc'
import { TRPCError } from '@trpc/server'
import { db } from '@/db'
import { z } from 'zod'
import { generateApiKey } from '@/lib/api-keys'
import { processDocument } from '@/lib/process-document'
import { storage } from '@/lib/storage'
import { ANSWER_LANGUAGES, ANSWER_STYLES } from '@/config/preferences'
import { assertSafeWebhookUrl, deliverWebhook, generateWebhookSecret, WEBHOOK_EVENTS } from '@/lib/webhooks'
import { embedQuery } from '@/lib/ai/gemini'
import { rateLimit } from '@/lib/rate-limit'
import { searchUserChunks } from '@/lib/vector-store'
import { getActivity, getApiSummary, getDailyTokens, getUsageSummary, utcNaive } from '@/lib/usage'

export const appRouter = router({
    authCallback: publicProcedure.query(async () => {
        const user = await getSessionUser();
        if ( !user )
            throw new TRPCError({ code: 'UNAUTHORIZED' })
        return { success: true }
    }),
    getUsage: privateProcedure.query(({ ctx }) => getUsageSummary(ctx.userId)),
    getDailyTokens: privateProcedure.query(({ ctx }) => getDailyTokens(ctx.userId)),
    listApiKeys: privateProcedure.query(({ ctx }) =>
        db.apiKey.findMany({
            where: { userId: ctx.userId, revokedAt: null },
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, prefix: true, createdAt: true, lastUsedAt: true },
        })
    ),
    createApiKey: privateProcedure
        .input(z.object({ name: z.string().trim().min(1).max(60) }))
        .mutation(async ({ ctx, input }) => {
            const active = await db.apiKey.count({ where: { userId: ctx.userId, revokedAt: null } })
            if ( active >= 10 ) throw new TRPCError({ code: 'BAD_REQUEST', message: 'You can have up to 10 active keys' })

            const { key, prefix, hash } = generateApiKey()
            await db.apiKey.create({ data: { name: input.name, prefix, hash, userId: ctx.userId } })
            return { key }
        }),
    revokeApiKey: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { count } = await db.apiKey.updateMany({
                where: { id: input.id, userId: ctx.userId, revokedAt: null },
                data: { revokedAt: new Date() },
            })
            if ( !count ) throw new TRPCError({ code: 'NOT_FOUND' })
            return { success: true }
        }),
    getApiSummary: privateProcedure.query(({ ctx }) => getApiSummary(ctx.userId)),
    getActivity: privateProcedure.query(({ ctx }) => getActivity(ctx.userId)),
    getMessages: privateProcedure
        .input(z.object({ fileId: z.string() }))
        .query(async ({ ctx, input }) => {
            const messages = await db.message.findMany({
                where: { fileId: input.fileId, userId: ctx.userId },
                orderBy: { createdAt: 'asc' },
                take: 200,
                select: { id: true, text: true, isUserMessage: true, createdAt: true },
            })
            return messages
        }),
    clearMessages: privateProcedure
        .input(z.object({ fileId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await db.message.deleteMany({ where: { fileId: input.fileId, userId: ctx.userId } })
            return { success: true }
        }),
    renameFile: privateProcedure
        .input(z.object({ id: z.string(), name: z.string().trim().min(1).max(120) }))
        .mutation(async ({ ctx, input }) => {
            const { count } = await db.file.updateMany({
                where: { id: input.id, userId: ctx.userId },
                data: { name: input.name },
            })
            if ( !count ) throw new TRPCError({ code: 'NOT_FOUND' })
            return { success: true }
        }),
    retryFile: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const file = await db.file.findFirst({ where: { id: input.id, userId: ctx.userId, uploadStatus: 'FAILED' } })
            if ( !file ) throw new TRPCError({ code: 'NOT_FOUND' })

            await db.documentChunk.deleteMany({ where: { fileId: file.id } })
            await db.file.update({ where: { id: file.id }, data: { uploadStatus: 'PROCESSING' } })
            void processDocument(file.id, file.key)
            return { success: true }
        }),
    searchDocuments: privateProcedure
        .input(z.object({ query: z.string().trim().min(2).max(300) }))
        .query(async ({ ctx, input }) => {
            const limit = rateLimit(`search:${ctx.userId}`, 30)
            if ( !limit.ok ) throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Searching too fast. Try again in a moment.' })

            const hits = await searchUserChunks(ctx.userId, await embedQuery(input.query), 12)
            return hits.map((h) => ({
                fileId: h.fileId,
                name: h.name,
                page: h.page,
                snippet: h.content.replace(/\s+/g, ' ').slice(0, 320),
                score: Math.round(h.score * 100),
            }))
        }),

    listChats: privateProcedure.query(({ ctx }) =>
        db.chat.findMany({
            where: { userId: ctx.userId },
            orderBy: { updatedAt: 'desc' },
            take: 30,
            select: { id: true, title: true, fileIds: true, updatedAt: true },
        })
    ),
    getChatMessages: privateProcedure
        .input(z.object({ chatId: z.string() }))
        .query(async ({ ctx, input }) => {
            const chat = await db.chat.findFirst({ where: { id: input.chatId, userId: ctx.userId }, select: { id: true, fileIds: true } })
            if ( !chat ) throw new TRPCError({ code: 'NOT_FOUND' })
            const messages = await db.message.findMany({
                where: { chatId: chat.id },
                orderBy: { createdAt: 'asc' },
                take: 200,
                select: { id: true, text: true, isUserMessage: true },
            })
            return { fileIds: chat.fileIds, messages }
        }),
    deleteChat: privateProcedure
        .input(z.object({ chatId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { count } = await db.chat.deleteMany({ where: { id: input.chatId, userId: ctx.userId } })
            if ( !count ) throw new TRPCError({ code: 'NOT_FOUND' })
            return { success: true }
        }),

    saveAnswer: privateProcedure
        .input(z.object({
            fileId: z.string().optional(),
            question: z.string().max(4000),
            answer: z.string().min(1).max(20000),
            note: z.string().max(1000).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const file = input.fileId ? await db.file.findFirst({ where: { id: input.fileId, userId: ctx.userId }, select: { id: true, name: true } }) : null
            const saved = await db.savedAnswer.create({
                data: {
                    userId: ctx.userId,
                    fileId: file?.id,
                    fileName: file?.name ?? 'Multiple documents',
                    question: input.question,
                    answer: input.answer,
                    note: input.note,
                },
            })
            return { id: saved.id }
        }),
    listSaved: privateProcedure.query(({ ctx }) =>
        db.savedAnswer.findMany({
            where: { userId: ctx.userId },
            orderBy: { createdAt: 'desc' },
            take: 200,
            select: { id: true, fileId: true, fileName: true, question: true, answer: true, note: true, createdAt: true },
        })
    ),
    updateSavedNote: privateProcedure
        .input(z.object({ id: z.string(), note: z.string().max(1000) }))
        .mutation(async ({ ctx, input }) => {
            const { count } = await db.savedAnswer.updateMany({ where: { id: input.id, userId: ctx.userId }, data: { note: input.note || null } })
            if ( !count ) throw new TRPCError({ code: 'NOT_FOUND' })
            return { success: true }
        }),
    deleteSaved: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { count } = await db.savedAnswer.deleteMany({ where: { id: input.id, userId: ctx.userId } })
            if ( !count ) throw new TRPCError({ code: 'NOT_FOUND' })
            return { success: true }
        }),

    listWebhooks: privateProcedure.query(({ ctx }) =>
        db.webhookEndpoint.findMany({
            where: { userId: ctx.userId },
            orderBy: { createdAt: 'desc' },
            select: { id: true, url: true, events: true, active: true, createdAt: true, lastAttemptAt: true, lastStatus: true, lastError: true, failureCount: true },
        })
    ),
    createWebhook: privateProcedure
        .input(z.object({ url: z.string().trim().max(500), events: z.array(z.enum(WEBHOOK_EVENTS)).min(1).default([...WEBHOOK_EVENTS]) }))
        .mutation(async ({ ctx, input }) => {
            if ( await db.webhookEndpoint.count({ where: { userId: ctx.userId } }) >= 5 )
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'You can have up to 5 webhook endpoints' })
            try {
                await assertSafeWebhookUrl(input.url)
            } catch ( err ) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: err instanceof Error ? err.message : 'Invalid URL' })
            }
            const secret = generateWebhookSecret()
            await db.webhookEndpoint.create({ data: { userId: ctx.userId, url: input.url, secret, events: input.events } })
            return { secret }
        }),
    setWebhookActive: privateProcedure
        .input(z.object({ id: z.string(), active: z.boolean() }))
        .mutation(async ({ ctx, input }) => {
            const { count } = await db.webhookEndpoint.updateMany({
                where: { id: input.id, userId: ctx.userId },
                data: { active: input.active, failureCount: 0 },
            })
            if ( !count ) throw new TRPCError({ code: 'NOT_FOUND' })
            return { success: true }
        }),
    deleteWebhook: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { count } = await db.webhookEndpoint.deleteMany({ where: { id: input.id, userId: ctx.userId } })
            if ( !count ) throw new TRPCError({ code: 'NOT_FOUND' })
            return { success: true }
        }),
    testWebhook: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const endpoint = await db.webhookEndpoint.findFirst({ where: { id: input.id, userId: ctx.userId } })
            if ( !endpoint ) throw new TRPCError({ code: 'NOT_FOUND' })
            return deliverWebhook(endpoint, 'test.ping', { message: 'This is a test event from Otterly.' })
        }),

    getPreferences: privateProcedure.query(async ({ ctx }) => {
        const u = await db.user.findUniqueOrThrow({
            where: { id: ctx.userId },
            select: { answerStyle: true, answerLanguage: true, notifyDocReady: true, notifyDocFailed: true },
        })
        return u
    }),
    updatePreferences: privateProcedure
        .input(z.object({
            answerStyle: z.enum(ANSWER_STYLES).optional(),
            answerLanguage: z.enum(ANSWER_LANGUAGES).optional(),
            notifyDocReady: z.boolean().optional(),
            notifyDocFailed: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            await db.user.update({ where: { id: ctx.userId }, data: input })
            return { success: true }
        }),
    deleteAllChats: privateProcedure.mutation(async ({ ctx }) => {
        const messages = await db.message.deleteMany({ where: { userId: ctx.userId } })
        const chats = await db.chat.deleteMany({ where: { userId: ctx.userId } })
        return { messages: messages.count, chats: chats.count }
    }),
    deleteAllDocuments: privateProcedure.mutation(async ({ ctx }) => {
        const files = await db.file.findMany({ where: { userId: ctx.userId }, select: { key: true } })
        await db.message.deleteMany({ where: { userId: ctx.userId } })
        await db.file.deleteMany({ where: { userId: ctx.userId } })
        await Promise.all(files.map((f) => storage.remove(f.key)))
        return { deleted: files.length }
    }),

    getUsageBreakdown: privateProcedure.query(async ({ ctx }) => {
        const usage = await getUsageSummary(ctx.userId)
        const since = new Date()
        since.setUTCHours(0, 0, 0, 0)
        since.setUTCDate(since.getUTCDate() - 29)

        const [dailyRows, docRows, sourceRows, keys] = await Promise.all([
            db.$queryRaw<{ day: string; source: string; tokens: number }[]>`
                select to_char("createdAt", 'YYYY-MM-DD') as day, source,
                       coalesce(sum("inputTokens" + "outputTokens"), 0)::int as tokens
                from "Message" where "userId" = ${ctx.userId} and "createdAt" >= ${utcNaive(since)}::timestamp
                group by 1, 2`,
            db.$queryRaw<{ name: string | null; tokens: number }[]>`
                select f.name as name, coalesce(sum(m."inputTokens" + m."outputTokens"), 0)::int as tokens
                from "Message" m left join "File" f on f.id = m."fileId"
                where m."userId" = ${ctx.userId} and m."createdAt" >= ${utcNaive(new Date(usage.periodStart))}::timestamp
                group by f.name order by tokens desc limit 8`,
            db.$queryRaw<{ source: string; tokens: number; questions: number }[]>`
                select source, coalesce(sum("inputTokens" + "outputTokens"), 0)::int as tokens,
                       count(*) filter (where "isUserMessage")::int as questions
                from "Message" where "userId" = ${ctx.userId} and "createdAt" >= ${utcNaive(new Date(usage.periodStart))}::timestamp
                group by source`,
            db.apiKey.aggregate({ where: { userId: ctx.userId }, _sum: { requestCount: true } }),
        ])

        const byDay = new Map<string, { app: number; api: number }>()
        for ( const r of dailyRows ) {
            const d = byDay.get(r.day) ?? { app: 0, api: 0 }
            d[r.source === 'api' ? 'api' : 'app'] += r.tokens
            byDay.set(r.day, d)
        }
        const daily = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(since)
            d.setUTCDate(since.getUTCDate() + i)
            const date = d.toISOString().slice(0, 10)
            return { date, ...(byDay.get(date) ?? { app: 0, api: 0 }) }
        })
        const src = (s: string) => sourceRows.find((r) => r.source === s) ?? { tokens: 0, questions: 0 }

        return {
            tokensUsed: usage.tokensUsed,
            tokenLimit: usage.tokenLimit,
            daily,
            byDocument: docRows.map((r) => ({ name: r.name ?? 'Multi-document chats and API', tokens: r.tokens })),
            app: { tokens: src('app').tokens, questions: src('app').questions },
            api: { tokens: src('api').tokens, questions: src('api').questions },
            apiRequests: keys._sum.requestCount ?? 0,
        }
    }),
    getUserFiles: privateProcedure.query(async ({ ctx }) => {
        const { userId } = ctx
        return await db.file.findMany({
            where: {
                userId,
            },
            select: { id: true, name: true, uploadStatus: true, createdAt: true, usedOcr: true },
        })
    }),
    getFileInsights: privateProcedure
        .input(z.object({ fileId: z.string() }))
        .query(async ({ ctx, input }) => {
            const file = await db.file.findFirst({
                where: { id: input.fileId, userId: ctx.userId },
                select: { summary: true, keyPoints: true, suggestions: true, usedOcr: true },
            })
            if ( !file ) throw new TRPCError({ code: 'NOT_FOUND' })

            const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
            return {
                summary: file.summary,
                keyPoints: list(file.keyPoints),
                suggestions: list(file.suggestions),
                usedOcr: file.usedOcr,
            }
        }),
    getFile: privateProcedure
        .input(z.object({ key: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx

            const file = await db.file.findFirst({
                where: {
                    key: input.key,
                    userId,
                },
            })
            if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

            return file
        }),

    getFileUploadStatus: privateProcedure
        .input(z.object({ fileId: z.string() }))
        .query(async ({ input, ctx }) => {
            const file = await db.file.findFirst({
                where: {
                    id: input.fileId,
                    userId: ctx.userId,
                },
            })

            if (!file) return { status: 'PENDING' as const }

            return { status: file.uploadStatus, reason: file.failureReason }
        }),

    deleteFile: privateProcedure.input(
        z.object({ id: z.string() })

    ).mutation(async ({ ctx, input }) => {
        const { userId } = ctx;
        const file = await db.file.findFirst({
            where: {
                id: input.id,
                userId,
            },
        })

        if ( !file ) throw new TRPCError({ code: 'NOT_FOUND' })

        await db.file.delete({
            where: {
                id: input.id,
            }
        })
        await storage.remove(file.key)
        return file
    }),
})

export type AppRouter = typeof appRouter
