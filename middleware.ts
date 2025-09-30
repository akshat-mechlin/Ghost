import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Extract subdomain
  const hostname = request.headers.get('host') || ''
  const subdomain = hostname.split('.')[0]
  
  // Skip middleware for main domain and auth routes
  if (subdomain === 'www' || subdomain === 'app' || hostname.includes('localhost')) {
    return NextResponse.next()
  }
  
  // Handle subdomain routing
  if (subdomain && !pathname.startsWith('/auth') && !pathname.startsWith('/api/auth')) {
    const token = await getToken({ req: request })
    
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(signInUrl)
    }
    
    // Verify user belongs to this organization
    if (token.subdomain !== subdomain) {
      return new NextResponse('Access Denied', { status: 403 })
    }
  }
  
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