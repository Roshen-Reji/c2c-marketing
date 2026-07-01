import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow the home page
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next()
  }

  // Allow next internals, static files, and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Allow registration and scholarship pages
  if (
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/scholarship')
  ) {
    return NextResponse.next()
  }

  // Redirect everything else to the home page
  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: '/:path*',
}
