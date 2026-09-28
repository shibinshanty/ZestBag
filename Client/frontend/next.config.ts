import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
         pathname: "/dtleeb3fr/image/upload/**",
      },
    ],
  },
};

export default nextConfig;
