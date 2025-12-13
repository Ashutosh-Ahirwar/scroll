/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Updated Policy:
            // 1. connect-src: Added walletconnect.com (RPCs), coinbase.com (analytics), and datadoghq.com (logging)
            // 2. img-src: Added blob: and data: for wallet icons
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; connect-src 'self' https: wss: https://*.walletconnect.com https://*.walletconnect.org https://cca-lite.coinbase.com https://*.datadoghq.com; img-src 'self' data: blob: https:; frame-src 'self' https:; style-src 'self' 'unsafe-inline';",
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;