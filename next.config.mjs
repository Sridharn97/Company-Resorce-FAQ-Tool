/** @type {import('next').NextConfig} */
const nextConfig = {
  // Windows-specific optimizations
  experimental: {
    // Disable some experimental features that can cause issues on Windows
    serverComponentsExternalPackages: [],
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devServer = {
        ...config.devServer,
        port: 3002, // Use different port for webpack HMR
      };
    }
    
    // Add Windows-specific webpack optimizations
    if (process.platform === 'win32') {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    
    return config;
  },
  // Disable telemetry to reduce process overhead
  telemetry: false,
};

export default nextConfig;
