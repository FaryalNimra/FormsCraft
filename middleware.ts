// middleware.ts
// 🔵 TEAMMATE - Route protection middleware
// Simple cookie-based auth check (no @supabase/ssr required)

import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check for Supabase auth token in cookies
  // Supabase stores session in cookies with names like 'sb-<project-ref>-auth-token'
  const hasAuthCookie = request.cookies.getAll().some(cookie => 
    cookie.name.includes('auth-token') || cookie.name.includes('sb-')
  );

  // Protected routes - redirect to login if not authenticated
  const protectedRoutes = ['/builder', '/dashboard', '/settings', '/responses'];
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !hasAuthCookie) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Auth routes - redirect to home if already authenticated
  const authRoutes = ['/login', '/signup'];
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isAuthRoute && hasAuthCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Only run middleware on specific routes
export const config = {
  matcher: [
    '/builder/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
    '/responses/:path*',
    '/login',
    '/signup',
  ],
};
