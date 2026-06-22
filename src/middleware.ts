import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  const cspHeader = [
    "default-src 'self';",
    "script-src 'self' https://www.googletagmanager.com;",
    "style-src 'self' 'unsafe-inline';",
    "img-src 'self' data: https:;",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com;",
    "frame-ancestors 'none';",
    "base-uri 'self';",
    "form-action 'self';"
  ].join(' ');

  const response = NextResponse.next();
  
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    // Apply security headers to all pages (exclude static assets and api route)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
