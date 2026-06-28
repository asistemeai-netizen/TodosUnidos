/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ["@todosunidos/db"],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '109.123.244.219',
        port: '9000',
        pathname: '/todosunidos/**',
      },
      {
        protocol: 'https',
        hostname: 'sismo911.com',
        pathname: '/api/familia/photo/**',
      },
      {
        protocol: 'https',
        hostname: 's3.asisteme.ai',
        pathname: '/todosunidos/**',
      },
    ],
  },
};

export default nextConfig;
