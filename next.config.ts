// Import NextConfig type
import type { NextConfig } from "next";

// Define Next.js configuration object
const nextConfig: NextConfig = {
  images: {
    // Allow images from any remote source to be loaded
    remotePatterns: [
      {
        protocol: "https", // Restrict to HTTPS protocol
        hostname: "**", // Allow images from any hostname
      },
    ],
  },
};

export default nextConfig; // Export the configuration for Next.js to use
