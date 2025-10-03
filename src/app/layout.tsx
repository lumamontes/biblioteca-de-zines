// layout.tsx
import type { Metadata } from "next";
import { Azeret_Mono } from "next/font/google";
import "./globals.css";
import { PropsWithChildren } from "react";
import { siteConfig } from "./config/site";
import { Toaster } from "sonner";

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
    url: "https://biblioteca-de-zines.com.br",
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/manifest/og.jpg`],
  },
  icons: {
    icon: "/manifest/favicon.ico",
    shortcut: "/manifest/favicon-16x16.png",
    apple: "/manifest/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={azeret.className}>
        <div>{children}</div>
        <Toaster 
          richColors 
          position="top-right" 
          duration={Infinity}
          closeButton
        />
      </body>
    </html>
  );
}
