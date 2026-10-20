import { describe, expect, it } from 'vitest';
import { linkCitations } from '../citations';

describe('linkCitations', () => {
    it('links single page citations', () => {
        expect(linkCitations('Refunds take 30 days (p. 3).')).toBe('Refunds take 30 days [(p. 3)](#page-3).');
    });
    it('links the first page of a range', () => {
        expect(linkCitations('See (pp. 4-6)')).toBe('See [(pp. 4-6)](#page-4)');
    });
    it('leaves other text alone', () => {
        expect(linkCitations('No citations (see above)')).toBe('No citations (see above)');
    });
});
