'use client'

import { trpc } from '@/app/_trpc/client'
import { absoluteUrl } from '@/lib/utils'
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { MotionConfig } from 'framer-motion'
import { PropsWithChildren, useState } from 'react'

const Providers = ({ children }: PropsWithChildren) => {
    const [queryClient] = useState(() => new QueryClient())
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
