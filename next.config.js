/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
  experimental: { esmExternals: 'loose' },
}
module.exports = nextConfig
