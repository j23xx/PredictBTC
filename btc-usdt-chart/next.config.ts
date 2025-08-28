import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: false,
  skipTrailingSlashRedirect: false,
};

export default nextConfig;
