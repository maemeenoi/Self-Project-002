import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request) {
  const path = request.nextUrl.pathname
  console.log("Middleware - Processing path:", path)

  // Skip middleware for API routes and public paths
  if (
    path.startsWith("/api/") ||
    path.startsWith("/auth/") ||
    path.startsWith("/register") ||
    path.startsWith("/_next/") ||
    path === "/"
  ) {
    return NextResponse.next()
  }

  try {
    // Check for the session cookie
    const sessionCookie = request.cookies.get("next-auth.session-token")?.value
    console.log("Middleware - Session cookie present:", !!sessionCookie)

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "your-default-secret",
      secureCookie: process.env.NODE_ENV === "production",
    })

    console.log("Middleware - Token details:", {
      exists: !!token,
      id: token?.id,
      email: token?.email,
    })

    if (!token) {
      console.log("Middleware - No token, redirecting to signin")
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    // Add user info to headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", token.id)
    requestHeaders.set("x-user-email", token.email)

    // Token exists, allow request to continue with user info
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error("Middleware - Error:", error)
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/leaderboard/:path*", "/rules/:path*"],
}
