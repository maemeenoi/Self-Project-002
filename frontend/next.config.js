/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
