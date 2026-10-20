'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface BillingButtonProps extends ButtonProps {
    action: 'checkout' | 'portal';
}

// Sends the user to Stripe Checkout or the billing portal.
function BillingButton({ action, children, ...props }: BillingButtonProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const go = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/stripe/${action}`, { method: 'POST' });
            const body = await res.json();
            if (!res.ok || !body.url) throw new Error(body.error ?? 'Something went wrong');
            window.location.href = body.url;
        } catch (err) {
            toast({ title: 'Billing unavailable', description: err instanceof Error ? err.message : 'Try again later', variant: 'destructive' });
            setLoading(false);
        }
    };

    return (
        <Button onClick={go} disabled={loading} {...props}>
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {children}
        </Button>
    );
}

export default BillingButton;
