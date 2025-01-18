import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname
    const token = req.nextauth?.token

    console.log("Middleware - Path:", path)
    console.log("Middleware - Token:", token)
    console.log("Middleware - Token authenticated:", token?.authenticated)

    // Special handling for registration page
    if (path.startsWith("/register")) {
      return NextResponse.next()
    }

    // If user is not authenticated, redirect to signin
    if (!token?.authenticated) {
      console.log("Middleware - Not authenticated, redirecting to signin")
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // For all other protected routes
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        console.log(
          "Middleware - Authorization check for:",
          req.nextUrl.pathname
        )
        console.log("Middleware - Token present:", !!token)
        console.log("Middleware - Token authenticated:", token?.authenticated)

        // Always allow registration page
        if (req.nextUrl.pathname.startsWith("/register")) {
          return true
        }

        return token?.authenticated === true
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
