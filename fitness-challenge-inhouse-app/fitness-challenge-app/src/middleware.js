import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req) {
  const path = req.nextUrl.pathname
  console.log("Middleware - Path:", path)

  // Always allow registration and signin pages
  if (path.startsWith("/register") || path.startsWith("/auth/signin")) {
    return NextResponse.next()
  }

  try {
    // Get the token and verify it
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    console.log("Middleware - Token:", token)

    // No token, redirect to signin
    if (!token) {
      console.log("Middleware - No token, redirecting to signin")
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Add the token to the request headers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-id", token.id)
    requestHeaders.set("x-user-email", token.email)

    // Continue with the modified request
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error("Middleware - Auth error:", error)
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/leaderboard/:path*",
    "/rules/:path*",
    "/register/:path*",
  ],
}
