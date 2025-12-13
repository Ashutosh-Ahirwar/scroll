import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@coinbase/onchainkit/styles.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ["latin"] });

// URL from your provided JSON
const appUrl = 'https://scroll-opal-ten.vercel.app';

export const metadata: Metadata = {
  title: "The Onchain Scroll",
  description: "A permanent, decentralized scroll living entirely on Base. Inscribe your thoughts, stories, or manifestos directly onchain. No servers, just ink and blocks.",
  openGraph: {
    title: "The Onchain Scroll",
    description: "Write directly onchain. Join the permanent collaborative scroll.",
    images: [`${appUrl}/hero.png`],
  },
  other: {
    // 1. Base App ID (Required for verification)
    "base:app_id": "693d3acfd77c069a945bde4f", // <--- ADDED THIS LINE

    // 2. Farcaster Mini App Metadata
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: `${appUrl}/hero.png`,
      button: {
        title: "Write Onchain",
        action: {
          type: "launch_miniapp",
          name: "The Onchain Scroll",
          url: appUrl,
          splashImageUrl: `${appUrl}/splash.png`,
          splashBackgroundColor: "#f4ecd8",
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}