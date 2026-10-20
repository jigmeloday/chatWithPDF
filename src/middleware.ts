import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

// Optimistic check only (cookie presence); pages still validate the real session.
export function middleware(req: NextRequest) {
    if (!getSessionCookie(req)) {
        const { pathname } = req.nextUrl;
        const url = new URL('/sign-in', req.url);
        url.searchParams.set('origin', pathname.slice(1));
        return NextResponse.redirect(url);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/documents', '/developers', '/settings', '/search', '/ask', '/saved', '/usage', '/webhooks'],
};
