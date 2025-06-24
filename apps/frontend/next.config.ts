import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript type checking - skip for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization
  images: {
    domains: [
      'localhost',
      'krakengaming.org',
      'preview.krakengaming.org',
      'storage.googleapis.com',
      'www.directart.co.uk',
      'img.youtube.com',
      'upload.wikimedia.org'
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Environment-based redirects
  async redirects() {
    const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

    if (maintenanceMode) {
      return [
        {
          source: '/((?!maintenance|_next|api|favicon.ico).*)',
          destination: '/maintenance',
          permanent: false,
        },
      ];
    }

    return [];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },

  // Output configuration for Cloud Run
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
};

export default nextConfig;
