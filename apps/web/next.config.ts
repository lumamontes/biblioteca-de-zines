import type { NextConfig } from "next";

/**
 * The community app (apps/community) is deployed on its own and served here at /comunidade.
 * Set COMMUNITY_ORIGIN to its deployment (for example http://localhost:4200) to turn it on.
 */
const communityOrigin = process.env.COMMUNITY_ORIGIN?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_COMMUNITY_ENABLED: communityOrigin ? "true" : "" },
  async rewrites() {
    if (!communityOrigin) return [];
    return [
      { source: "/comunidade", destination: `${communityOrigin}/comunidade` },
      { source: "/comunidade/:path*", destination: `${communityOrigin}/comunidade/:path*` },
    ];
  },
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "blogger.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "dl.dropboxusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.substack.com",
      },
      {
        protocol: "https",
        hostname: "substackcdn.com",
      },
      {
        protocol: "https",
        hostname: "biblioteca-de-zines.com.br",
      },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
