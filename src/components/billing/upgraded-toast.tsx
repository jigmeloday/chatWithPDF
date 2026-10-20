'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Stripe sends people back with ?upgraded=1. Confirm it with a toast, then tidy the URL.
export default function UpgradedToast() {
    const params = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const upgraded = params.get('upgraded') === '1';

    useEffect(() => {
        if (!upgraded) return;
        toast({ title: 'Thanks for upgrading!', description: 'Your new plan is active. It can take a few seconds to show up.' });
        router.replace('/billing');
        router.refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [upgraded]);

    return null;
}
