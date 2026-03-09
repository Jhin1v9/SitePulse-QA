/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
  experimental: {
    outputFileTracingIncludes: {
      "/api/run-plan": [
        "./qa/src/**/*",
        "./qa/package.json",
        "./qa/audit*.json",
        "./qa/node_modules/**/*",
      ],
      "/api/run-plan/route": [
        "./qa/src/**/*",
        "./qa/package.json",
        "./qa/audit*.json",
        "./qa/node_modules/**/*",
      ],
    },
  },
};

module.exports = nextConfig;
