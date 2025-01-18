import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request) {
  const path = request.nextUrl.pathname
  console.log("Middleware - Processing path:", path)

  // Always allow these paths
  if (
    path.startsWith("/auth") ||
    path.startsWith("/register") ||
    path === "/api/auth/session"
  ) {
    console.log("Middleware - Allowing public path:", path)
    return NextResponse.next()
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    })

    console.log("Middleware - Token found:", !!token)

    if (token) {
      console.log("Middleware - User authenticated:", token.email)
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-user-id", token.id)
      requestHeaders.set("x-user-email", token.email)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }

    console.log("Middleware - No valid token, redirecting to signin")
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  } catch (error) {
    console.error("Middleware - Error verifying token:", error)
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
