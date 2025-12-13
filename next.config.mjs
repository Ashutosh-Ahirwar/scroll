/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 1. Allow images from ANY hostname (needed for user PFP avatars)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // 2. Security & CORS Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Allows Farcaster to load your frame
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS', // FIX: Explicitly allow methods
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization', // FIX: Allow common headers
          },
          {
            key: 'Content-Security-Policy',
            // Allows WalletConnect, Coinbase, and other necessary scripts
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; connect-src 'self' https: wss: https://*.walletconnect.com https://*.walletconnect.org https://cca-lite.coinbase.com https://*.datadoghq.com; img-src 'self' data: blob: https:; frame-src 'self' https:; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;