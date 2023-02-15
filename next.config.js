/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
    domains: ["avatars.githubusercontent.com", "images.unsplash.com"],
  },
  experimental: {
    // appDir: true,
  },
}

module.exports = nextConfig
