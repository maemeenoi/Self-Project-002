import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

// Fallback secret key for development
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production"

// Define public paths that don't require authentication
const publicPaths = [
  "/",
  "/auth/login",
  "/auth/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/me",
  "/api/auth/logout",
]

export function middleware(request) {
  const { pathname } = request.nextUrl
  console.log("Middleware handling path:", pathname)

  // Allow access to public paths
  if (publicPaths.includes(pathname)) {
    console.log("Public path, allowing access")
    return NextResponse.next()
  }

  // Allow access to static files and images
  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname === "/favicon.ico"
  ) {
    console.log("Static file, allowing access")
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get("token")?.value
  console.log("Token found:", !!token)

  if (!token) {
    console.log("No token, redirecting to login")
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  try {
    // Verify token
    const decoded = verify(token, JWT_SECRET)
    console.log("Token verified, allowing access to:", pathname)

    // Add the token to the request headers for API routes
    if (pathname.startsWith("/api/")) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("Authorization", `Bearer ${token}`)
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }

    return NextResponse.next()
  } catch (error) {
    console.log("Token verification failed, redirecting to login")
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
}

// Configure middleware to match all paths except static files and images
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
