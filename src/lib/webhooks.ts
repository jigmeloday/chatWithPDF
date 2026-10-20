import { createHmac, randomBytes } from 'crypto';
import { lookup } from 'dns/promises';
import { isIP } from 'net';
import { db } from '@/db';

export const WEBHOOK_EVENTS = ['document.ready', 'document.failed'] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number] | 'test.ping';

const ATTEMPT_DELAYS_MS = [0, 2_000, 8_000]; // initial try plus two retries
const REQUEST_TIMEOUT_MS = 8_000;
const DISABLE_AFTER_FAILURES = 10;

export const generateWebhookSecret = () => `whsec_${randomBytes(24).toString('base64url')}`;

// Signature header format: `t=<unix seconds>,v1=<hex hmac-sha256 of "t.body">`. Receivers should also reject old timestamps.
export const signPayload = (secret: string, timestamp: number, body: string) =>
    createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');

const isPrivateAddress = (ip: string) => {
    if (ip === '::1' || ip === '::' || ip.startsWith('fe80:') || ip.startsWith('fc') || ip.startsWith('fd')) return true;
    const v4 = ip.replace(/^::ffff:/, '');
    const m = v4.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (!m) return false;
    const [a, b] = [Number(m[1]), Number(m[2])];
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
};

// Server-side request forgery guard: in production only public https hosts are allowed.
export const assertSafeWebhookUrl = async (raw: string) => {
    let url: URL;
    try {
        url = new URL(raw);
    } catch {
        throw new Error('Enter a valid URL');
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('URL must start with https://');
    if (url.username || url.password) throw new Error('URLs with credentials are not allowed');
    if (process.env.NODE_ENV !== 'production') return url; // local development may target localhost

    if (url.protocol !== 'https:') throw new Error('URL must use https://');
    const host = url.hostname.replace(/^\[|\]$/g, '');
    const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => []);
    if (!addresses.length) throw new Error('Could not resolve that hostname');
    if (addresses.some((a) => isPrivateAddress(a.address))) throw new Error('URL must point to a public address');
    return url;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Endpoint {
    id: string;
    url: string;
    secret: string;
}

// Delivers one event with retries and records the outcome on the endpoint.
export const deliverWebhook = async (endpoint: Endpoint, type: WebhookEvent, data: unknown) => {
    const body = JSON.stringify({ id: `evt_${randomBytes(8).toString('hex')}`, type, createdAt: new Date().toISOString(), data });
    let status: number | null = null;
    let error: string | null = null;

    for (const delay of ATTEMPT_DELAYS_MS) {
        if (delay) await sleep(delay);
        try {
            await assertSafeWebhookUrl(endpoint.url);
            const timestamp = Math.floor(Date.now() / 1000);
            const res = await fetch(endpoint.url, {
                method: 'POST',
                redirect: 'manual',
                cache: 'no-store',
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Otterly-Webhooks/1.0',
                    'Otterly-Event': type,
                    'Otterly-Signature': `t=${timestamp},v1=${signPayload(endpoint.secret, timestamp, body)}`,
                },
                body,
            });
            status = res.status;
            error = res.ok ? null : `Receiver responded with ${res.status}`;
            if (res.ok) break;
        } catch (err) {
            status = null;
            error = err instanceof Error ? err.message : 'Delivery failed';
        }
    }

    const ok = error === null;
    const updated = await db.webhookEndpoint
        .update({
            where: { id: endpoint.id },
            data: {
                lastAttemptAt: new Date(),
                lastStatus: status,
                lastError: error,
                failureCount: ok ? 0 : { increment: 1 },
            },
        })
        .catch(() => null); // endpoint may have been deleted meanwhile

    // Stop hammering endpoints that keep failing; the user can re-enable them.
    if (updated && updated.failureCount >= DISABLE_AFTER_FAILURES)
        await db.webhookEndpoint.update({ where: { id: endpoint.id }, data: { active: false } }).catch(() => undefined);

    return { ok, status, error };
};

// Fire-and-forget: sends the event to every active endpoint of the user that subscribed to it.
export const emitWebhookEvent = async (userId: string, type: WebhookEvent, data: unknown) => {
    const endpoints = await db.webhookEndpoint.findMany({ where: { userId, active: true, events: { has: type } } });
    for (const endpoint of endpoints) void deliverWebhook(endpoint, type, data);
};
