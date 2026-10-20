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

const Providers = ({ children }: PropsWithChildren) => {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
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
