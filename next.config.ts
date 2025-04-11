import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Ensure type errors are caught during build
    ignoreBuildErrors: false,
  },
  eslint: {
    // Ensure linting errors are caught during build
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pngimg.com',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Add any other image sources you might use
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
    // Set reasonable image cache duration
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
    // Disable static image imports if not needed
    disableStaticImages: false,
  },
  // Improve build performance
  experimental: {
    // Enable React compiler for better performance
    reactCompiler: false, // Disabled until babel-plugin-react-compiler is installed
  },
  // Disable x-powered-by header for slightly better security
  poweredByHeader: false,
};

export default nextConfig;

