import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled PPR/cacheComponents: can cause hydration/runtime issues in production.
  // cacheComponents: true,
  // partialPrefetching: true,
  productionBrowserSourceMaps: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;