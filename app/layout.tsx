import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@coinbase/onchainkit/styles.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ["latin"] });

// Use environment variable for the URL, fallback to localhost
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://scroll-opal-ten.vercel.app'; 

export const metadata: Metadata = {
  title: "The Onchain Scroll",
  description: "A collaborative history book on Base. Write your legacy onchain.",
  openGraph: {
    title: "The Onchain Scroll",
    description: "Write your legacy on the permanent collaborative scroll.",
    images: [`${appUrl}/hero.png`],
  },
  other: {
    // UPDATED: New "fc:miniapp" standard (was fc:frame)
    "fc:miniapp": JSON.stringify({
      version: "1", // UPDATED: Must be "1", not "next"
      imageUrl: `${appUrl}/hero.png`,
      button: {
        title: "Write Onchain",
        action: {
          type: "launch_miniapp", // UPDATED: New action name
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