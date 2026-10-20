import { describe, expect, it } from 'vitest';
import { friendlyError } from '../errors';

describe('friendlyError', () => {
    it('passes through ordinary messages', () => {
        expect(friendlyError(new Error('You can have up to 5 webhook endpoints'))).toBe('You can have up to 5 webhook endpoints');
        expect(friendlyError('Invalid email or password')).toBe('Invalid email or password');
    });

    it('reads the first message out of tRPC zod validation errors', () => {
        const zod = JSON.stringify([{ code: 'too_small', message: 'String must contain at least 1 character(s)', path: ['name'] }]);
        expect(friendlyError(new Error(zod))).toBe('String must contain at least 1 character(s)');
    });

    it('never shows raw JSON for malformed validation errors', () => {
        expect(friendlyError(new Error('[not json'))).toBe('Please check what you entered and try again.');
        expect(friendlyError(new Error('[]'))).toBe('Please check what you entered and try again.');
    });

    it('explains network failures and expired sessions', () => {
        expect(friendlyError(new Error('fetch failed'))).toMatch(/network/i);
        expect(friendlyError(new Error('UNAUTHORIZED'))).toMatch(/sign in/i);
    });

    it('falls back for empty or unknown values', () => {
        expect(friendlyError(undefined)).toBe('Something went wrong. Please try again.');
        expect(friendlyError(new Error(''), 'Custom fallback')).toBe('Custom fallback');
    });
});
