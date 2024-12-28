/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        os: false,
        path: false,
        stream: false,
        util: false,
        buffer: false,
        http: false,
        https: false,
        zlib: false
      }
    }
    return config
  },
  experimental: {
    serverActions: true
  }
}

module.exports = nextConfig 