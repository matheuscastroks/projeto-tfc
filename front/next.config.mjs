/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.pictographic.io',
        pathname: '/illustrations/**',
      },
    ],
  },
}

export default nextConfig
