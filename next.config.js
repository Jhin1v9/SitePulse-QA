/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
