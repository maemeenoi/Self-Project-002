import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname
    console.log("Middleware - Path:", path)

    // Always allow registration page
    if (path.startsWith("/register")) {
      return NextResponse.next()
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Token is automatically checked by NextAuth middleware
        return !!token
      },
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
