import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@coinbase/onchainkit/styles.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ["latin"] });

// ⚠️ IMPORTANT: REPLACE THIS WITH YOUR ACTUAL VERCEL DOMAIN
const appUrl = 'https://scroll-opal-ten.vercel.app'; 

export const metadata: Metadata = {
  title: "The Onchain Scroll",
  description: "A collaborative history book on Base. Write your legacy onchain.",
  openGraph: {
    title: "The Onchain Scroll",
    description: "Write your legacy on the permanent collaborative scroll.",
    images: [`${appUrl}/hero.png`],
  },
  other: {
    // STANDARD FRAME V2 EMBED TAG
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${appUrl}/hero.png`,
      button: {
        title: "Write Onchain",
        action: {
          type: "launch_frame",
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