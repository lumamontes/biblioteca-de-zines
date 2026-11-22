import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@biblioteca-de-zines/reader'],
  async headers() {
    const api = new URL(process.env.NEXT_PUBLIC_READER_API_ORIGIN ?? 'https://www.biblioteca-de-zines.com.br');
    const isLocal = api.hostname === 'localhost' || api.hostname === '127.0.0.1';
    const apiOrigin = api.protocol === 'https:' || (isLocal && api.protocol === 'http:') ? api.origin : '';
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: `default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: blob: https:; connect-src 'self' ${apiOrigin}; frame-ancestors *` },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};

export default nextConfig;
