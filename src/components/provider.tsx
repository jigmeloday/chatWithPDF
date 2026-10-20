'use client'

import { trpc } from '@/app/_trpc/client'
import { absoluteUrl } from '@/lib/utils'
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { MotionConfig } from 'framer-motion'
import { toast } from '@/hooks/use-toast'
import { friendlyError } from '@/lib/errors'
import { PropsWithChildren, useState } from 'react'

const recentErrors = new Map<string, number>()

const Providers = ({ children }: PropsWithChildren) => {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    // A failed data load (after retries) tells the user once, not on every poll.
                    queries: {
                        onError: (err) => {
                            const code = (err as { data?: { code?: string } })?.data?.code;
                            if (code === 'UNAUTHORIZED') return; // the auth flow already redirects
                            const description = friendlyError(err);
                            const now = Date.now();
                            if (now - (recentErrors.get(description) ?? 0) < 8000) return;
                            recentErrors.set(description, now);
                            toast({ title: 'Could not load data', description, variant: 'destructive' });
                        },
                    },
                    // One place to tell the user when an action fails, instead of each screen handling it.
                    mutations: {
                        onError: (err) => toast({ title: 'Something went wrong', description: friendlyError(err), variant: 'destructive' }),
                    },
                },
            })
    )
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: absoluteUrl("/api/trpc"),
                }),
            ],
        })
    )

    return (
        <trpc.Provider
            client={trpcClient}
            queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {/* Respect the OS "reduce motion" setting */}
                <MotionConfig reducedMotion='user'>{children}</MotionConfig>
            </QueryClientProvider>
        </trpc.Provider>
    )
}

export default Providers
