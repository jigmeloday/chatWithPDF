// Runs once when the server starts: warn early about missing configuration.
export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;

    const required = ['DATABASE_URL', 'BETTER_AUTH_SECRET', 'BETTER_AUTH_URL', 'GOOGLE_API_KEY', 'GROQ_API_KEY'];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length) console.warn(`\n⚠️  Missing required env vars: ${missing.join(', ')}\n`);

    if (!process.env.STRIPE_SECRET_KEY) console.info('ℹ️  Stripe is not configured: upgrades are disabled.');
    if (!process.env.RESEND_API_KEY) console.info('ℹ️  Resend is not configured: emails are printed to this console.');
}
