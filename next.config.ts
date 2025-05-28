import type { NextConfig } from "next";
import "./src/env.js";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard?asset=btc",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
