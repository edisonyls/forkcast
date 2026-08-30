import type { NextConfig } from "next";

const SERVICES_VM_IP = process.env.SERVICES_VM_IP || "127.0.0.1";
const SERVICES_VM_PORT = process.env.SERVICES_VM_PORT || "13000";

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
        protocol: "https",
        hostname: "forkcast.edisonyls.com",
        port: "",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: SERVICES_VM_IP,
        port: SERVICES_VM_PORT,
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: SERVICES_VM_PORT,
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `http://${SERVICES_VM_IP}:${SERVICES_VM_PORT}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
