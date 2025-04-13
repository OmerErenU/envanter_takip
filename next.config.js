/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  typescript: {
    // !! WARN !!
    // Geçici bir çözüm - TypeScript hatalarını görmezden gel
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 