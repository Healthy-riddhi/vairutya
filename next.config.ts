import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Where Strapi lives (used for uploaded images). Set STRAPI_URL in .env.local
const strapi = new URL(process.env.STRAPI_URL ?? "http://localhost:1337");
const strapiIsLocal = ["localhost", "127.0.0.1"].includes(strapi.hostname);

const nextConfig: NextConfig = {
  images: {
    // Next 16 refuses to optimise images from localhost unless told otherwise.
    // Only enabled when Strapi itself is local (i.e. development).
    dangerouslyAllowLocalIP: strapiIsLocal,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: strapi.protocol === "https:" ? "https" : "http",
        hostname: strapi.hostname,
        port: strapi.port,
        pathname: "/uploads/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
