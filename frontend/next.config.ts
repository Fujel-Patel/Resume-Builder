import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
  ],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
      "sonner",
    ],
  },
  transpilePackages: ["html2canvas"],
};

export default nextConfig;
