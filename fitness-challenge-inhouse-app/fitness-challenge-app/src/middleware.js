import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname
    console.log("Middleware - Path:", path)
    console.log("Middleware - Token:", req.nextauth?.token)

    // If user is not authenticated, redirect to signin
    if (!req.nextauth?.token) {
      console.log("Middleware - No token, redirecting to signin")
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Special handling for registration page
    if (path.startsWith("/register")) {
      return NextResponse.next()
    }

    // For all other protected routes
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        console.log(
          "Middleware - Checking authorization for:",
          req.nextUrl.pathname
        )
        console.log("Middleware - Token present:", !!token)
        console.log("Middleware - Token details:", token)

        // Always allow registration page
        if (req.nextUrl.pathname.startsWith("/register")) {
          return true
        }

        return !!token
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/leaderboard/:path*",
    "/rules/:path*",
    "/register/:path*",
  ],
}
