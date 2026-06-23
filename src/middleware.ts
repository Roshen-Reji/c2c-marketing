import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow the home page
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next()
  }

  // Allow next internals and static files
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Redirect everything else to the home page
  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: '/:path*',
}
