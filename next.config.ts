import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "https://kesiolabs-slave1.tail4be241.ts.net/:path*",
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "atgovdjrppvmxkxygqii.supabase.co", 
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "kesiolabs-slave1.tail4be241.ts.net",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "*.up.railway.app", // Railway üzerindeki tüm alt alan adlarına izin verir
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      }
    ],
  },
};

export default nextConfig;
