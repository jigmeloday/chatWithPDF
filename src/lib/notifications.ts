import { db } from '@/db';
import { actionEmail } from '@/lib/email';
import { siteUrl } from '@/lib/stripe';

// Emails the user about a finished document, if they opted in under Settings → Notifications.
export const notifyUser = async (userId: string, kind: 'ready' | 'failed', name: string, fileId: string, reason?: string) => {
    try {
        const u = await db.user.findUnique({ where: { id: userId }, select: { email: true, notifyDocReady: true, notifyDocFailed: true } });
        if (!u) return;
        const url = `${siteUrl()}/dashboard/${fileId}`;
        if (kind === 'ready' && u.notifyDocReady)
            await actionEmail(u.email, `"${name}" is ready to chat`, `Your document "${name}" has been processed and is ready for questions.`, 'Open document', url);
        if (kind === 'failed' && u.notifyDocFailed)
            await actionEmail(u.email, `Couldn't process "${name}"`, `We couldn't process "${name}". ${reason ?? ''}`.trim(), 'View documents', `${siteUrl()}/documents`);
    } catch (err) {
        console.error('Notification failed:', err); // never let email problems affect processing
    }
};
