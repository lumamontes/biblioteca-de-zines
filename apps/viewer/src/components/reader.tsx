'use client';

import type { CSSProperties } from 'react';
import { useReaderController } from './use-reader-controller';
import { ReaderHeader, ReaderBrand } from './reader-content';
import { BIBLIOTECA_LOGO_URL } from './reader-config';
import type { ReaderProps } from './reader-component-types';

export function Reader({ slug, surface, branding = 'none', theme, mode = '2up', page = 1 }: ReaderProps) {
  const { fallback, publication, state, target } = useReaderController({ mode, page, slug, surface });
  const title = publication?.title ?? slug;
  const style = theme ? { '--reader-background': theme.background, '--reader-text': theme.text } as CSSProperties : undefined;

  return (
    <main className={`reader${surface === 'embed' ? ' reader--embed' : ''}`} style={style}>
      {surface === 'standalone' ? <ReaderHeader branding={branding} pdfUrl={fallback.url} title={title} /> : branding === 'biblioteca' && <header className="reader__brand"><ReaderBrand logoUrl={BIBLIOTECA_LOGO_URL} /></header>}
      <section className="reader__workspace">
        <div className="reader__stage">
          <div aria-label={`Leitura digital de ${title}`} className="reader__canvas" ref={target} />
          {state === 'loading' && <div aria-live="polite" className="reader__status"><span className="reader__spinner" />Carregando leitor...</div>}
          {state === 'fallback' && (
            <div className="reader__fallback" role="alert">
              <span className="reader__fallbackMark">!</span>
              <div>
                <p className="reader__fallbackTitle">A leitura em páginas não pôde ser carregada.</p>
                <p className="reader__fallbackText">Você ainda pode abrir o arquivo original para continuar a leitura.</p>
                {fallback.url ? <a className="reader__fallbackLink" href={fallback.url} rel="noreferrer" target="_blank">{fallback.label}</a> : <span className="reader__fallbackText">O PDF original não está disponível.</span>}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
