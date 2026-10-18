import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@biblioteca/reader-contracts'],
  async headers() {
    const localApiOrigin = process.env.NEXT_PUBLIC_READER_API_ORIGIN?.startsWith('http://localhost:3000')
      ? ' http://localhost:3000'
      : '';
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: `default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: blob: https:; connect-src 'self' https://biblioteca-de-zines.com.br${localApiOrigin}; frame-ancestors *` },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};

export default nextConfig;
