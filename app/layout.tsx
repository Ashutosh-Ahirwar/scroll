import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@coinbase/onchainkit/styles.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ["latin"] });

// 1. DEFINE YOUR APP URL
const appUrl = 'https://scroll-opal-ten.vercel.app'; // <--- REPLACE WITH YOUR ACTUAL VERCEL URL

// 2. CONSTRUCT THE FRAME METADATA JSON
const frameMetadata = JSON.stringify({
  next: {
    imageUrl: `${appUrl}/hero.png`, // Must match the image you put in public/
  },
});

export const metadata: Metadata = {
  title: "The Onchain Scroll",
  description: "A collaborative history book on Base. Write your legacy onchain.",
  openGraph: {
    title: "The Onchain Scroll",
    description: "Write your legacy on the permanent collaborative scroll.",
    images: [`${appUrl}/hero.png`],
  },
  other: {
    // 3. ADD FARCASTER SPECIFIC TAGS
    "fc:frame": frameMetadata,
    "fc:miniapp": frameMetadata, // Forward compatibility
    "fc:frame:image": `${appUrl}/hero.png`,
    "fc:frame:button:1": "Open Scroll",
    "fc:frame:post_url": `${appUrl}/api/frame`, // Optional if you add server interactions later
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