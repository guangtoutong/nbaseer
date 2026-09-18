/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Cloudflare Pages
  output: "standalone",

  // Disable image optimization for Cloudflare
  images: {
    unoptimized: true,
  },
};

// `next dev` has no Cloudflare bindings of its own, so every API route fails on
// getRequestContext() and the site can only be exercised in production. Reusing the
// worker's wrangler.toml picks up the same D1 binding without introducing a root
// config file that Cloudflare Pages would also interpret at deploy time.
// Wrapped in try/catch on purpose: this is a local convenience, and it must never
// be able to fail the Cloudflare Pages build, which is the one path that has to
// keep working.
if (process.env.NODE_ENV === "development") {
  try {
    const { setupDevPlatform } = await import("@cloudflare/next-on-pages/next-dev");
    await setupDevPlatform({
      configPath: "./worker/wrangler.toml",
      persist: { path: "./worker/.wrangler/state/v3" },
    });
  } catch (err) {
    console.warn("[next.config] local D1 bindings unavailable:", err?.message ?? err);
  }
}

export default nextConfig;
