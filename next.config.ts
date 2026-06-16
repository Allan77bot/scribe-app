import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos de profil servies depuis le bucket public Supabase Storage.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;
