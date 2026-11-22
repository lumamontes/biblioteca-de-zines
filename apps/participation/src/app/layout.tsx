import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { DemoNotice } from '@/components/layout/demo-notice.component';
import { SiteFooter } from '@/components/layout/site-footer.component';
import { SiteHeader } from '@/components/layout/site-header.component';
import { getParticipationServer } from '@/composition/server/participation-server.service';
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
  title: { default: 'Participe · Biblioteca de Zines', template: '%s · Participe · Biblioteca de Zines' },
  description: 'Ajude a decidir o que a Biblioteca de Zines faz em seguida: sugira, vote, comente e acompanhe as respostas da equipe.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { settings, fixtureGitHub } = await getParticipationServer();
  return (
    <html lang="pt-BR" className={azeret.variable}>
      <body>
        <a href="#content" className="skip-link">Pular para o conteúdo</a>
        <SiteHeader catalogueUrl={settings.catalogueUrl} />
        {fixtureGitHub.kind === 'fixture' ? <DemoNotice durable={settings.durableData} /> : null}
        <main id="content" tabIndex={-1} className="site-main">
          {children}
        </main>
        <SiteFooter catalogueUrl={settings.catalogueUrl} repository={fixtureGitHub.repository} />
      </body>
    </html>
  );
}
