import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the path and check if it's a protected route
  const path = request.nextUrl.pathname
  
  // Define paths that should be public (not require authentication)
  const publicPaths = [
    '/student/login',
    '/supervisor/login',
    '/admin/login',
    '/admin/register'
  ]
  
  // Skip protection check for public paths
  if (publicPaths.some(publicPath => path === publicPath)) {
    return NextResponse.next()
  }
  
  // Define protected path patterns
  const protectedPaths = [
    '/student',
    '/supervisor',
    '/admin',
  ]
  
  // Check if the current path matches any protected path
  const isProtectedPath = protectedPaths.some(prefix => 
    path === prefix || path.startsWith(`${prefix}/`)
  )
  
  if (isProtectedPath) {
    // Get the token from cookies
    const token = request.cookies.get('access_token')?.value
    
    // If no token exists, redirect to the login page
    if (!token) {
      // Determine which login page to redirect to based on the path
      let loginPath = '/'
      if (path.startsWith('/student/')) {
        loginPath = '/student/login'
      } else if (path.startsWith('/supervisor/')) {
        loginPath = '/supervisor/login'
      } else if (path.startsWith('/admin/')) {
        loginPath = '/admin/login'
      }
      
      const url = new URL(loginPath, request.url)
      return NextResponse.redirect(url)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/student/:path*',
    '/supervisor/:path*',
    '/admin/:path*'
  ],
} 