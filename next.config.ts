import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    typedRoutes: false,
  },
  // Configure server-side components to allow Firebase connections
  serverExternalPackages: ['firebase-admin'],
};

export default nextConfig;
