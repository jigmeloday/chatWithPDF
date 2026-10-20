import { SUPPORT_EMAIL } from '@/config/site';

// Sends through Resend when configured; otherwise logs the email so links work in local dev.
export const emailEnabled = !!process.env.RESEND_API_KEY;

export const sendEmail = async ({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) => {
    if (!process.env.RESEND_API_KEY) {
        console.log(`\n[email to ${to}] ${subject}\n${text}\n`);
        return;
    }
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({ from: process.env.EMAIL_FROM ?? 'Otterly <onboarding@resend.dev>', to, subject, html, reply_to: SUPPORT_EMAIL }),
    });
    if (!res.ok) console.error('Email send failed:', res.status, await res.text());
};

export const actionEmail = (to: string, subject: string, intro: string, button: string, url: string) =>
    sendEmail({
        to,
        subject,
        text: `${intro}\n\n${url}`,
        html: `<p>${intro}</p><p><a href="${url}" style="background:#16a34a;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">${button}</a></p><p style="color:#71717a;font-size:12px">If the button doesn't work, paste this link in your browser:<br>${url}</p>`,
    });
