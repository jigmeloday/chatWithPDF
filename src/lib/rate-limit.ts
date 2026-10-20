// In-memory sliding window. Per server instance only: use Redis/Upstash once you run more than one.
const hits = new Map<string, number[]>();

export const rateLimit = (key: string, limit: number, windowMs = 60_000) => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

    if (recent.length >= limit) {
        hits.set(key, recent);
        return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
    }
    recent.push(now);
    hits.set(key, recent);

    // Keep memory bounded.
    if (hits.size > 10_000)
        hits.forEach((v, k) => {
            if (!v.some((t) => now - t < windowMs)) hits.delete(k);
        });
    return { ok: true, retryAfter: 0 };
};

export const tooManyRequests = (retryAfter: number, json = false) =>
    json
        ? Response.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } })
        : new Response('Too many requests', { status: 429, headers: { 'Retry-After': String(retryAfter) } });
