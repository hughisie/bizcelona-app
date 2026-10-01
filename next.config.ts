import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Lets <ViewTransition> animate between public pages (home, events).
    viewTransition: true,
  },
};

export default nextConfig;
