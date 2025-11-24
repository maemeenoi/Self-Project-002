/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Creates optimized standalone deployment
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3001",
        "https://app-makestuffgo-test-001-frontend.azurewebsites.net",
      ],
    },
  },
  images: {
    domains: ["localhost"],
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_JWT_SECRET: process.env.NEXT_PUBLIC_JWT_SECRET,
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
