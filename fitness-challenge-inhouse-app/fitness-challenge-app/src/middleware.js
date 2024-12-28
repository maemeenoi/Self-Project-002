export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/dashboard/:path*", "/leaderboard/:path*", "/rules/:path*"],
}
