import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ajkhzvjxvpuoxfthrkkc.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Serve the generated PNG favicon at /favicon.ico so non-HTML pages (the /api
  // JSON endpoints) and Google's /favicon.ico fallback resolve to our brand mark
  // instead of the browser's default placeholder.
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon" }];
  },
};

export default nextConfig;
