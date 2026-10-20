// Turns any thrown value (tRPC, fetch, Better Auth) into a short, readable sentence.
export const friendlyError = (err: unknown, fallback = 'Something went wrong. Please try again.') => {
    const message = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
    if (!message) return fallback;

    // tRPC returns validation failures as a JSON array of zod issues.
    if (message.trimStart().startsWith('[')) {
        try {
            const issues = JSON.parse(message) as { message?: string }[];
            return issues[0]?.message ?? 'Please check what you entered and try again.';
        } catch {
            return 'Please check what you entered and try again.';
        }
    }
    if (/fetch failed|NetworkError|Failed to fetch/i.test(message)) return 'Network problem. Check your connection and try again.';
    if (message === 'UNAUTHORIZED') return 'Your session has expired. Please sign in again.';
    return message;
};
