import { createHash, randomBytes } from 'crypto';
import { db } from '@/db';

const KEY_PREFIX = 'dc_live_';

const hashKey = (key: string) => createHash('sha256').update(key).digest('hex');

// The full key is returned once; only its hash is stored.
export const generateApiKey = () => {
    const key = `${KEY_PREFIX}${randomBytes(24).toString('base64url')}`;
    return { key, prefix: key.slice(0, KEY_PREFIX.length + 4), hash: hashKey(key) };
};

export const API_RATE_LIMIT_PER_MINUTE = 60;

export const authenticateApiKey = async (req: Request): Promise<string | null> => {
    const key = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!key?.startsWith(KEY_PREFIX)) return null;

    const record = await db.apiKey.findUnique({ where: { hash: hashKey(key) } });
    if (!record || record.revokedAt) return null;

    await db.apiKey.update({ where: { id: record.id }, data: { lastUsedAt: new Date(), requestCount: { increment: 1 } } });
    return record.userId;
};
