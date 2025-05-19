import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["dashing-wombat-686.convex.cloud", "img.clerk.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
        port: "",
        pathname: "/api/storage/**",
      },
    ],
  },
  devIndicators: false,
};

export default nextConfig;
