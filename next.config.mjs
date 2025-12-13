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
            value: '*', 
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Content-Security-Policy',
            // UPDATED POLICY:
            // 1. style-src: Added 'https://fonts.googleapis.com' for Google Fonts
            // 2. font-src: Added 'https://fonts.gstatic.com' for the actual font files
            // 3. connect-src: Added 'https://explorer-api.walletconnect.com' and Datadog intake domains
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; connect-src 'self' https: wss: https://*.walletconnect.com https://*.walletconnect.org https://explorer-api.walletconnect.com https://cca-lite.coinbase.com https://*.datadoghq.com https://*.browser-intake-datadoghq.com; img-src 'self' data: blob: https:; frame-src 'self' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;