/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // (app router için iyidir)
  experimental: { typedRoutes: true },
  webpack: (config) => {
    // Bu iki modülü paketleme => uyarýlar biter
    config.resolve.alias['@react-native-async-storage/async-storage'] = false;
    config.resolve.alias['pino-pretty'] = false;
    return config;
  },
};

module.exports = nextConfig;
