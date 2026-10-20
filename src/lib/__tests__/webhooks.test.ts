import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/db', () => ({ db: {} }));

import { assertSafeWebhookUrl, generateWebhookSecret, signPayload } from '../webhooks';

describe('signPayload', () => {
    it('is deterministic and depends on secret, timestamp and body', () => {
        const base = signPayload('s', 100, '{"a":1}');
        expect(base).toBe(signPayload('s', 100, '{"a":1}'));
        expect(base).not.toBe(signPayload('s2', 100, '{"a":1}'));
        expect(base).not.toBe(signPayload('s', 101, '{"a":1}'));
        expect(base).not.toBe(signPayload('s', 100, '{"a":2}'));
        expect(base).toMatch(/^[0-9a-f]{64}$/);
    });
});

describe('generateWebhookSecret', () => {
    it('creates unique prefixed secrets', () => {
        const a = generateWebhookSecret();
        expect(a.startsWith('whsec_')).toBe(true);
        expect(a).not.toBe(generateWebhookSecret());
    });
});

describe('assertSafeWebhookUrl in production', () => {
    afterEach(() => vi.unstubAllEnvs());

    const rejects = async (url: string) => {
        vi.stubEnv('NODE_ENV', 'production');
        await expect(assertSafeWebhookUrl(url)).rejects.toThrow();
    };

    it('rejects non-https', () => rejects('http://example.com/hook'));
    it('rejects localhost and loopback', async () => {
        await rejects('https://127.0.0.1/hook');
        await rejects('https://[::1]/hook');
    });
    it('rejects private ranges and cloud metadata', async () => {
        await rejects('https://10.0.0.5/hook');
        await rejects('https://192.168.1.10/hook');
        await rejects('https://172.20.0.1/hook');
        await rejects('https://169.254.169.254/latest/meta-data');
    });
    it('rejects credentials in the URL and garbage', async () => {
        await rejects('https://user:pw@example.com/hook');
        await rejects('not a url');
        await rejects('ftp://example.com');
    });
    it('accepts a public https address', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        await expect(assertSafeWebhookUrl('https://93.184.216.34/hook')).resolves.toBeInstanceOf(URL);
    });
});
