import type { NextConfig } from "next";

// Replace SERVICES_VM_IP with the actual IP address of your Services VM
const SERVICES_VM_IP = process.env.SERVICES_VM_IP || "192.168.1.105";
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL || `http://${SERVICES_VM_IP}:3000`;

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "forkcast.edisonyls.com",
        port: "",
        pathname: "/uploads/**",
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
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3006",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "api-gateway",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "upload-service",
        port: "3006",
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_GATEWAY_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
