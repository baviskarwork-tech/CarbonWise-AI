import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // Production-grade Content Security Policy
  // Configured to permit Firebase, Google Maps, and Gemini APIs.
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://apis.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://maps.gstatic.com https://maps.googleapis.com https://*.googleapis.com https://lh3.googleusercontent.com;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com wss://*.firebaseio.com https://generativelanguage.googleapis.com;
    frame-src 'self' https://*.firebaseapp.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim();

  const response = NextResponse.next();
  
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self)'
  );
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    // Apply security headers to all pages (exclude static assets and api route)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
