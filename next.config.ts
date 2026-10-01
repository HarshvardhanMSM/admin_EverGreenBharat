import type { NextConfig } from "next";

const backendBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:3000";

const nextConfig: NextConfig = {
  // Enable HTTP response compression (gzip/brotli) for all pages and chunks
  compress: true,

  // Security: Remove X-Powered-By header
  poweredByHeader: false,

  // React Strict Mode for robust lifecycle validation
  reactStrictMode: true,

  // Tree-shake large client libraries for faster page loading and smaller bundle sizes
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "cmdk"],
  },

  // Strip console.log from production builds while keeping errors and warnings
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // Image optimization remote patterns
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "https", hostname: "**" },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendBaseUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendBaseUrl}/api/v1/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;

