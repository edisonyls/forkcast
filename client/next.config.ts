import type { NextConfig } from "next";

function requireEnvironmentVariable(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. See .env.example.`,
    );
  }

  return value.replace(/\/+$/, "");
}

const API_GATEWAY_URL = requireEnvironmentVariable("API_GATEWAY_URL");
const PUBLIC_API_URL = new URL(
  requireEnvironmentVariable("NEXT_PUBLIC_API_URL"),
);
const ALLOW_LOCAL_IMAGE_OPTIMIZATION = ["localhost", "127.0.0.1"].includes(
  PUBLIC_API_URL.hostname,
);

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    dangerouslyAllowLocalIP: ALLOW_LOCAL_IMAGE_OPTIMIZATION,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: PUBLIC_API_URL.protocol.slice(0, -1) as "http" | "https",
        hostname: PUBLIC_API_URL.hostname,
        port: PUBLIC_API_URL.port,
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
