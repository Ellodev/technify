/** @type {import('next').NextConfig} */
const API_URL = process.env.API_URL || "http://localhost:8000";

const nextConfig = {
  output: "standalone",
  async rewrites() {
    // Proxy API calls to the backend so the browser only ever talks to one
    // origin (no CORS, works unchanged in compose/k8s).
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
