/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Cloudflare Pages
  output: "standalone",

  // Disable image optimization for Cloudflare
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
