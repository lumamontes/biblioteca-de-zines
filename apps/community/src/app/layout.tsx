import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { SiteFooter } from '@/components/layout/site-footer.component';
import { SiteHeader } from '@/components/layout/site-header.component';
import { getCommunityServer } from '@/composition/server/community-server.service';
import './globals.css';

const azeret = localFont({
  src: [
    { path: './fonts/azeret-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/azeret-mono-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-azeret',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Comunidade | Biblioteca de Zines', template: '%s | Comunidade | Biblioteca de Zines' },
  description: 'Sugira, vote e acompanhe as melhorias da Biblioteca de Zines.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { settings, fixtureGitHub } = await getCommunityServer();
  return (
    <html lang="pt-BR" className={azeret.variable}>
      <body>
        <a href="#content" className="skip-link">Pular para o conteúdo</a>
        <SiteHeader catalogueUrl={settings.catalogueUrl} />
        <main id="content" tabIndex={-1} className="page">
          {children}
        </main>
        <SiteFooter repository={fixtureGitHub.repository} demo={fixtureGitHub.kind === 'fixture'} />
      </body>
    </html>
  );
}
