import type { Metadata } from "next";
import { Azeret_Mono } from "next/font/google";
import "./globals.css";
import { PropsWithChildren } from "react";
import { siteConfig } from "./config/site";
import { Toaster } from "sonner";
import { OrganizationStructuredData } from "@/components/seo/structured-data";

const azeret = Azeret_Mono({ 
  subsets: ["latin"],
  variable: "--font-azeret",
  display: "swap"
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: [
    "zines",
    "zines brasileiros", 
    "arte independente",
    "publicações independentes",
    "artistas brasileiros",
    "cultura underground",
    "fanzines",
    "quadrinhos independentes",
    "ilustração brasileira",
    "arte latina",
    "biblioteca digital",
    "zine culture",
    "DIY publishing"
  ],
  authors: [{ name: "Luma Montes" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://biblioteca-de-zines.com.br",
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Biblioteca de Zines - Arquivo digital de zines brasileiros e latino-americanos",
      },
    ],
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
    <html lang="pt-BR" className={azeret.variable}>
      <body suppressHydrationWarning>
        <OrganizationStructuredData />
        <div className={azeret.className}>{children}</div>
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
