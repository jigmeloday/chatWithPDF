'use client';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { friendlyError } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';

// Signs out, tells the user how it went, and returns them to the landing page.
export const useSignOut = () => {
    const router = useRouter();
    const { toast } = useToast();

    return async () => {
        const { error } = await authClient.signOut();
        if (error) {
            toast({ title: 'Could not sign out', description: friendlyError(error.message), variant: 'destructive' });
            return;
        }
        toast({ title: 'Signed out', description: 'See you soon.' });
        router.push('/');
        router.refresh();
    };
};
