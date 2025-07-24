import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware to protect all routes except login
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const isPublicPath = path === '/admin/login' || 
                      path.startsWith('/api/') ||
                      path.startsWith('/_next/') ||
                      path.startsWith('/static/')

  // Get the token from cookies
  const token = request.cookies.get('token')?.value || ''

  // Redirect to login if accessing protected route without token
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Redirect to admin dashboard if accessing root or login with token
  if (token && (path === '/' || path === '/admin/login')) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|sounds).*)',
  ],
}