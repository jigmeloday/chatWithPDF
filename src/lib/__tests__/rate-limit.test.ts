import { describe, expect, it } from 'vitest';
import { rateLimit } from '../rate-limit';

describe('rateLimit', () => {
    it('allows up to the limit then blocks with a retry time', () => {
        const key = `t-${Math.random()}`;
        expect(rateLimit(key, 2).ok).toBe(true);
        expect(rateLimit(key, 2).ok).toBe(true);
        const blocked = rateLimit(key, 2);
        expect(blocked.ok).toBe(false);
        expect(blocked.retryAfter).toBeGreaterThan(0);
    });

    it('tracks keys independently', () => {
        const a = `a-${Math.random()}`;
        rateLimit(a, 1);
        expect(rateLimit(a, 1).ok).toBe(false);
        expect(rateLimit(`b-${Math.random()}`, 1).ok).toBe(true);
    });

    it('frees the window after it passes', () => {
        const key = `w-${Math.random()}`;
        rateLimit(key, 1, 20);
        expect(rateLimit(key, 1, 20).ok).toBe(false);
        return new Promise<void>((resolve) =>
            setTimeout(() => {
                expect(rateLimit(key, 1, 20).ok).toBe(true);
                resolve();
            }, 40)
        );
    });
});
