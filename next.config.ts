import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The admin panel sends a flyer image (up to 3 MB) through a server action.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
