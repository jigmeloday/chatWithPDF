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
import { storage } from '@/lib/storage'
import { getActivity, getApiSummary, getDailyTokens, getUsageSummary } from '@/lib/usage'

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
    getUserFiles: privateProcedure.query(async ({ ctx }) => {
        const { userId } = ctx
        return await db.file.findMany({
            where: {
                userId,
            },
        })
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

            return { status: file.uploadStatus }
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
