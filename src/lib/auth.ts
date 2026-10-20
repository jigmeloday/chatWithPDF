import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';
import { db } from '@/db';

export const auth = betterAuth({
    database: prismaAdapter(db, { provider: 'postgresql' }),
    emailAndPassword: { enabled: true },
    plugins: [nextCookies()],
});

export const getSessionUser = async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user ?? null;
};
