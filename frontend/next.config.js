/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // (app router i�in iyidir)
  experimental: { typedRoutes: true },
  webpack: (config) => {
    // Bu iki mod�l� paketleme => uyar�lar biter
    config.resolve.alias['@react-native-async-storage/async-storage'] = false;
    config.resolve.alias['pino-pretty'] = false;
    return config;
  },
};

module.exports = nextConfig;
