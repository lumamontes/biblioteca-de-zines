import type { NextConfig } from 'next';

// The catalogue (apps/web) rewrites /comunidade to this app, so pages, assets and server
// actions all live under the same path. Keep in sync with src/app/base-path.config.ts.
const BASE_PATH = '/comunidade';

/** Hosts that may submit server actions through the catalogue's rewrite, e.g. "biblioteca-de-zines.com.br,localhost:3000". */
const allowedOrigins = (process.env.COMMUNITY_ALLOWED_ORIGINS ?? 'localhost:3000').split(',').map((host) => host.trim()).filter(Boolean);

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  poweredByHeader: false,
  experimental: { serverActions: { allowedOrigins } },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        // Next inlines its bootstrap scripts, so script-src keeps 'unsafe-inline' until nonces are added.
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'" },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};

export default nextConfig;
