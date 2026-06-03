import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 
     Fix for Next.js 16+ Turbopack conflict:
     PWAs rely on Webpack. This setting (and running with --webpack)
     ensures compatibility with the next-pwa plugin.
  */
  turbopack: {}, 
};

export default withPWA(nextConfig);
