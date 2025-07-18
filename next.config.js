/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone mode for direct Node.js deployment
  // output: 'standalone',
  
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  
  // External packages for database
  serverExternalPackages: ['pg'],
  
  // Trust proxy headers from Fly.io
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
