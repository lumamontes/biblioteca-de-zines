// layout.tsx
import type { Metadata } from "next";
import { Azeret_Mono } from "next/font/google";
import "./globals.css";
import { PropsWithChildren } from "react";
import { siteConfig } from "./config/site";

const azeret = Azeret_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: ["Graphic novel", "Illustration", "Comics"],
  authors: [
    {
      name: "Luma Montes",
    },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://biblioteca-de-zines.vercel.app",
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og.jpg`],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
};

type Props = PropsWithChildren<{
  dialog: React.ReactNode;
}>;

export default function RootLayout({ children, dialog }: Props) {
  return (
    <html lang="en">
      <body className={azeret.className}>
        <div className="relative">{children}</div>
        {dialog}
      </body>
    </html>
  );
}
