import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    console.log("Middleware - Checking auth for path:", req.nextUrl.pathname)
    console.log("Middleware - Token:", req.nextauth?.token)

    // Allow the request to continue
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

        if (token) return true
        return false
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
