/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a second dev server (e.g. for testing) run without sharing build files with the main one.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  experimental: { instrumentationHook: true },
};

export default nextConfig;
