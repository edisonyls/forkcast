import type { NextConfig } from "next";

// Replace SERVICES_VM_IP with the actual IP address of your Services VM
const SERVICES_VM_IP = process.env.SERVICES_VM_IP || "SERVICES_VM_IP";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: SERVICES_VM_IP,
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: SERVICES_VM_IP,
        port: "3006",
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `http://${SERVICES_VM_IP}:3000/api/:path*`,
      },
    ];
  },
  // Configure the app to run on port 3001 to avoid conflicts
  async serverRuntimeConfig() {
    return {
      port: 3001,
    };
  },
};

export default nextConfig;
