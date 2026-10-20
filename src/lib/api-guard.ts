import { API_RATE_LIMIT_PER_MINUTE, authenticateApiKey } from '@/lib/api-keys';
import { rateLimit } from '@/lib/rate-limit';

type Guard = { userId: string; headers: Record<string, string>; response?: undefined } | { response: Response };

// Authenticates an API key and applies the per-account rate limit. Every /api/v1 route starts with this.
export const apiGuard = async (req: Request): Promise<Guard> => {
    const userId = await authenticateApiKey(req);
    if (!userId) return { response: Response.json({ error: 'Invalid or missing API key' }, { status: 401 }) };

    const limit = rateLimit(`api:${userId}`, API_RATE_LIMIT_PER_MINUTE);
    const headers: Record<string, string> = {
        'X-RateLimit-Limit': String(API_RATE_LIMIT_PER_MINUTE),
        'X-RateLimit-Remaining': String(limit.remaining),
    };
    if (!limit.ok) {
        return {
            response: Response.json(
                { error: 'Too many requests' },
                { status: 429, headers: { ...headers, 'Retry-After': String(limit.retryAfter) } }
            ),
        };
    }
    return { userId, headers };
};
