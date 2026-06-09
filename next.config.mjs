/** @type {import('next').NextConfig} */
const nextConfig = {
  // The app boots a single client-mounted SPA; StrictMode's double-invoke
  // in dev would inject the legacy scripts twice, so disable it.
  reactStrictMode: false,
};

export default nextConfig;
