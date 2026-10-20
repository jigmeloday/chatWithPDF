'use client';
import { ReactNode, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// A titled card with an optional footer bar for actions.
export function SettingsCard({
    title,
    description,
    footer,
    danger,
    children,
}: {
    title: string;
    description?: string;
    footer?: ReactNode;
    danger?: boolean;
    children: ReactNode;
}) {
    return (
        <section className={cn('overflow-hidden rounded-2xl bg-white shadow-sm ring-1', danger ? 'ring-red-200' : 'ring-zinc-950/5')}>
            <div className='p-6'>
                <h2 className={cn('text-base font-semibold', danger ? 'text-red-700' : 'text-zinc-900')}>{title}</h2>
                {description && <p className='mt-1 text-sm text-zinc-500'>{description}</p>}
                <div className='mt-5'>{children}</div>
            </div>
            {footer && <div className={cn('flex items-center justify-between gap-3 border-t px-6 py-3', danger ? 'border-red-100 bg-red-50/50' : 'border-zinc-100 bg-zinc-50/70')}>{footer}</div>}
        </section>
    );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
    return (
        <label className='block'>
            <span className='text-sm font-medium text-zinc-800'>{label}</span>
            <div className='mt-1.5'>{children}</div>
            {hint && <span className='mt-1 block text-xs text-zinc-500'>{hint}</span>}
        </label>
    );
}

// An on/off toggle.
export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
    return (
        <button
            type='button'
            role='switch'
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:opacity-50',
                checked ? 'bg-green-600' : 'bg-zinc-300'
            )}>
            <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-0.5')} />
        </button>
    );
}

export function SaveButton({ loading, disabled, children = 'Save changes' }: { loading?: boolean; disabled?: boolean; children?: ReactNode }) {
    return (
        <Button type='submit' size='sm' disabled={loading || disabled}>
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />} {children}
        </Button>
    );
}

// Confirmation dialog. With `requireText`, the user must type it before the action unlocks.
export function ConfirmDialog({
    open,
    onClose,
    title,
    description,
    confirmLabel,
    onConfirm,
    loading,
    requireText,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
    loading?: boolean;
    requireText?: string;
}) {
    const [typed, setTyped] = useState('');
    const locked = !!requireText && typed.trim().toLowerCase() !== requireText.toLowerCase();

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) { setTyped(''); onClose(); } }}>
            <DialogContent>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
                {requireText && (
                    <div>
                        <p className='text-sm text-zinc-600'>Type <b>{requireText}</b> to confirm.</p>
                        <Input value={typed} onChange={(e) => setTyped(e.target.value)} className='mt-2' autoFocus />
                    </div>
                )}
                <DialogFooter className='gap-2'>
                    <Button variant='outline' onClick={onClose}>Cancel</Button>
                    <Button variant='destructive' disabled={loading || locked} onClick={onConfirm}>
                        {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />} {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
