'use client';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { BadgeCheck, Camera, Check, Copy, Loader2, MailWarning, Trash } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Field, SaveButton, SettingsCard } from './ui';

export interface SettingsUser {
    id: string;
    name: string;
    email: string;
    image: string | null;
    emailVerified: boolean;
    createdAt: string;
}

// Crops to a centered square and shrinks to 256px so uploads stay tiny.
const resizeToSquare = (file: File, size = 256) =>
    new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const side = Math.min(img.width, img.height);
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = size;
            canvas.getContext('2d')!.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
            canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process the image'))), 'image/jpeg', 0.9);
            URL.revokeObjectURL(img.src);
        };
        img.onerror = () => reject(new Error('That file is not a readable image'));
        img.src = URL.createObjectURL(file);
    });

export function Avatar({ user, size = 'h-20 w-20 text-2xl' }: { user: Pick<SettingsUser, 'name' | 'email' | 'image'>; size?: string }) {
    return user.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.image} alt='' className={`${size} shrink-0 rounded-full object-cover ring-2 ring-white shadow`} />
    ) : (
        <span className={`${size} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-700 font-semibold text-white shadow`}>
            {(user.name || user.email).charAt(0).toUpperCase()}
        </span>
    );
}

export default function ProfileSection({ user }: { user: SettingsUser }) {
    const router = useRouter();
    const { toast } = useToast();
    const fileRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState(user.image);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [name, setName] = useState(user.name);

    const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setUploading(true);
        try {
            const blob = await resizeToSquare(file);
            const form = new FormData();
            form.append('file', blob, 'avatar.jpg');
            const res = await fetch('/api/avatar', { method: 'POST', body: form });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error ?? 'Upload failed');
            setImage(body.image);
            toast({ title: 'Photo updated' });
            router.refresh();
        } catch (err) {
            toast({ title: 'Could not upload photo', description: err instanceof Error ? err.message : 'Try again', variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = async () => {
        setUploading(true);
        await fetch('/api/avatar', { method: 'DELETE' });
        setImage(null);
        setUploading(false);
        toast({ title: 'Photo removed' });
        router.refresh();
    };

    const saveName = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { error } = await authClient.updateUser({ name: name.trim() });
        setSaving(false);
        if (error) return toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
        toast({ title: 'Profile updated' });
        router.refresh();
    };

    const resendVerification = async () => {
        const { error } = await authClient.sendVerificationEmail({ email: user.email, callbackURL: '/settings' });
        toast(error ? { title: 'Could not send email', description: error.message, variant: 'destructive' } : { title: 'Verification email sent', description: 'Check your inbox.' });
    };

    return (
        <div className='space-y-6'>
            <SettingsCard title='Profile photo' description='Shown in the sidebar and menus. JPEG, PNG or WebP.'>
                <div className='flex flex-wrap items-center gap-5'>
                    <Avatar user={{ ...user, image }} size='h-24 w-24 text-3xl' />
                    <div className='flex flex-wrap gap-2'>
                        <input ref={fileRef} type='file' accept='image/png,image/jpeg,image/webp' onChange={onPick} className='hidden' />
                        <Button type='button' size='sm' variant='outline' disabled={uploading} onClick={() => fileRef.current?.click()}>
                            {uploading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Camera className='mr-2 h-4 w-4' />} Upload photo
                        </Button>
                        {image && (
                            <Button type='button' size='sm' variant='ghost' disabled={uploading} onClick={removePhoto} className='text-zinc-600'>
                                <Trash className='mr-2 h-4 w-4' /> Remove
                            </Button>
                        )}
                    </div>
                </div>
            </SettingsCard>

            <form onSubmit={saveName}>
                <SettingsCard
                    title='Personal information'
                    description='Your name appears in the sidebar and greeting.'
                    footer={
                        <>
                            <span className='text-xs text-zinc-500'>{name.trim() !== user.name ? 'You have unsaved changes' : 'Up to date'}</span>
                            <SaveButton loading={saving} disabled={!name.trim() || name.trim() === user.name} />
                        </>
                    }>
                    <div className='grid gap-5 md:grid-cols-2'>
                        <Field label='Full name'>
                            <Input value={name} onChange={(e) => setName(e.target.value)} required className='h-10' />
                        </Field>
                        <Field label='Email address' hint='Used to sign in. It can’t be changed here.'>
                            <Input value={user.email} disabled className='h-10' />
                        </Field>
                    </div>
                    <div className='mt-4 flex flex-wrap items-center gap-3 text-sm'>
                        {user.emailVerified ? (
                            <span className='inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-green-700 ring-1 ring-green-600/20'>
                                <BadgeCheck className='h-4 w-4' /> Email verified
                            </span>
                        ) : (
                            <>
                                <span className='inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-600/20'>
                                    <MailWarning className='h-4 w-4' /> Email not verified
                                </span>
                                <button type='button' onClick={resendVerification} className='font-medium text-green-700 hover:underline'>
                                    Resend verification email
                                </button>
                            </>
                        )}
                    </div>
                </SettingsCard>
            </form>

            <SettingsCard title='Account details'>
                <dl className='grid gap-4 text-sm sm:grid-cols-2'>
                    <div>
                        <dt className='text-zinc-500'>Member since</dt>
                        <dd className='mt-1 font-medium text-zinc-900'>{format(new Date(user.createdAt), 'MMMM d, yyyy')}</dd>
                    </div>
                    <div>
                        <dt className='text-zinc-500'>User ID</dt>
                        <dd className='mt-1 flex items-center gap-2'>
                            <code className='truncate rounded bg-zinc-100 px-2 py-0.5 text-xs'>{user.id}</code>
                            <button
                                type='button'
                                aria-label='Copy user ID'
                                onClick={async () => {
                                    await navigator.clipboard.writeText(user.id);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 1500);
                                }}
                                className='rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'>
                                {copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
                            </button>
                        </dd>
                    </div>
                </dl>
            </SettingsCard>
        </div>
    );
}
