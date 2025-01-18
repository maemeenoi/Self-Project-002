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
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      console.log("Middleware - No token, redirecting to signin")
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    // Token exists, allow request to continue
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware - Error:", error)
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/leaderboard/:path*", "/rules/:path*"],
}
