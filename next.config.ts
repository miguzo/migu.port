// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The player box is never wider than min(98vw, 430px), so the default
    // device sizes (which top out at 3840) only ever pick candidates far
    // larger than anything we can display. These are sized to the real box:
    // 430 = 1x desktop, 860 = 2x, 1290 = 3x phone.
    deviceSizes: [430, 640, 860, 1080, 1290, 1920],
  },
};

export default nextConfig;
