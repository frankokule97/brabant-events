import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s1.ticketm.net" },
      { protocol: "https", hostname: "s2.ticketm.net" },
      { protocol: "https", hostname: "s3.ticketm.net" },
      { protocol: "https", hostname: "s4.ticketm.net" },
    ],
  },
};

export default nextConfig;
