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
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' blob: data: https:;
              font-src 'self' data: https://fonts.gstatic.com;
              connect-src 'self' 
                https://explorer-api.walletconnect.com 
                https://*.walletconnect.com 
                wss://*.walletconnect.com 
                https://cca-lite.coinbase.com 
                https://*.alchemyapi.io 
                https://*.base.org 
                https://base-mainnet.g.alchemy.com 
                https://farcaster.xyz 
                https://client.farcaster.xyz 
                https://warpcast.com 
                https://client.warpcast.com 
                https://wrpcd.net 
                https://*.wrpcd.net 
                https://privy.farcaster.xyz 
                https://privy.warpcast.com 
                https://auth.privy.io 
                https://*.rpc.privy.systems 
                https://cloudflareinsights.com 
                https://*.browser-intake-datadoghq.com;
              frame-src 'self' https://verify.walletconnect.com;
            `.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;