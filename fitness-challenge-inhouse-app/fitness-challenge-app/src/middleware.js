import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Always allow access to auth-related pages
    if (path.startsWith('/auth/') || path === '/register') {
      return NextResponse.next()
    }

    // If user is not authenticated, they'll be redirected to sign-in by NextAuth
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Check if user needs registration and isn't already on the registration page
    if (path !== '/register') {
      try {
        const response = await fetch(`${req.nextUrl.origin}/api/user-profile?email=${token.email}`)
        const data = await response.json()
        
        if (!data.exists && path !== '/register') {
          return NextResponse.redirect(new URL('/register', req.url))
        }
      } catch (error) {
        console.error('Error checking user profile:', error)
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/leaderboard/:path*',
    '/rules/:path*',
    '/register',
    '/profile/:path*'
  ]
} 