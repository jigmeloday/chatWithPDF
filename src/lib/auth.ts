import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';
import { db } from '@/db';
import { actionEmail, emailEnabled } from '@/lib/email';
import { storage } from '@/lib/storage';

const strict = { window: 60, max: 5 };

export const auth = betterAuth({
    database: prismaAdapter(db, { provider: 'postgresql' }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        // Only block unverified users when emails can actually be delivered.
        requireEmailVerification: emailEnabled,
        sendResetPassword: ({ user, url }) =>
            actionEmail(user.email, 'Reset your Otterly password', 'We received a request to reset your password.', 'Reset password', url),
    },
    emailVerification: {
        sendOnSignUp: emailEnabled,
        autoSignInAfterVerification: true,
        sendVerificationEmail: ({ user, url }) =>
            actionEmail(user.email, 'Verify your Otterly email', 'Welcome to Otterly! Confirm your email address to get started.', 'Verify email', url),
    },
    user: {
        deleteUser: {
            enabled: true,
            // Remove everything the user owns, including the PDFs on disk.
            beforeDelete: async (user) => {
                const files = await db.file.findMany({ where: { userId: user.id }, select: { key: true } });
                await db.message.deleteMany({ where: { userId: user.id } });
                await db.file.deleteMany({ where: { userId: user.id } });
                await Promise.all([...files.map((f) => storage.remove(f.key)), storage.remove(`avatar_${user.id}`)]);
            },
        },
    },
    rateLimit: {
        enabled: true,
        window: 60,
        max: 100,
        customRules: {
            '/sign-in/email': strict,
            '/sign-up/email': strict,
            '/request-password-reset': strict,
            '/forget-password': strict,
        },
    },
    plugins: [nextCookies()],
});

export const getSessionUser = async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user ?? null;
};
