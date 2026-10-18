import type { CSSProperties } from 'react';
import type { ReaderFallbackProps, ReaderHeaderProps } from './reader-component-types';
import { BIBLIOTECA_LOGO_URL } from './reader-config';

export function ReaderFallback({ branding, fallback, surface, theme, title }: ReaderFallbackProps) {
  return (
    <main className={`reader${surface === 'embed' ? ' reader--embed' : ''}`} style={theme ? { '--reader-background': theme.background, '--reader-text': theme.text } as CSSProperties : undefined}>
      {surface === 'standalone' ? <ReaderHeader branding={branding} pdfUrl={fallback.url} title={title} /> : branding === 'biblioteca' && <header className="reader__brand"><ReaderBrand /></header>}
      <section className="reader__fallback">
        <p role="alert">A leitura em páginas não pôde ser carregada.</p>
        {fallback.url ? <a href={fallback.url} rel="noreferrer">{fallback.label}: {title}</a> : <p>O PDF original não está disponível.</p>}
      </section>
    </main>
  );
}

export function ReaderHeader({ branding, pdfUrl, title }: ReaderHeaderProps) {
  return (
    <header className="reader__header">
      <div className="reader__headerIdentity">
        {branding === 'biblioteca' && <ReaderBrand />}
        <div>
          <p className="reader__title">{title}</p>
        </div>
      </div>
      {pdfUrl && <a className="reader__headerLink" href={pdfUrl} rel="noreferrer" target="_blank">Abrir PDF original</a>}
    </header>
  );
}

export function ReaderBrand({ logoUrl = BIBLIOTECA_LOGO_URL }: { logoUrl?: string }) {
  return <img alt="Biblioteca de Zines" className="reader__brandImage" src={logoUrl} />;
}
