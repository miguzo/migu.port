import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },

  async rewrites() {
    return [
      {
        source: "/",
        destination: "/player",
        has: [
          {
            type: "host",
            value: "migu-player.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
