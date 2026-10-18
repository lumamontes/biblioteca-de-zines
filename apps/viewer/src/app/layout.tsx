import type { Metadata } from 'next';
import { Azeret_Mono } from 'next/font/google';
import './globals.css';

export const metadata: Metadata = {
  title: 'Biblioteca de Zines - Leitor',
  robots: { index: false, follow: false },
};

const azeret = Azeret_Mono({
  subsets: ['latin'],
  variable: '--font-azeret',
  display: 'swap',
});

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className={azeret.variable}><body className={azeret.className} suppressHydrationWarning>{children}</body></html>;
}
