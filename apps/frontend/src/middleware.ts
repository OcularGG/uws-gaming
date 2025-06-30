import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Temporary middleware without auth to fix Prisma Edge Runtime issue
export function middleware(request: NextRequest) {
  // For now, just allow all requests to pass through
  // TODO: Implement proper auth middleware that works with Edge Runtime
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
