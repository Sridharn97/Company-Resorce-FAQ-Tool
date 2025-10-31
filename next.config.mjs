/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devServer = {
        ...config.devServer,
        port: 3002, // Use different port for webpack HMR
      };
    }
    return config;
  },
};

export default nextConfig;
