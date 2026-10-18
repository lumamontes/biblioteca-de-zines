'use client';

import type { ReaderBranding, ReaderEmbedConfiguration } from '@biblioteca-de-zines/reader-contracts';
import { useReaderController } from './use-reader-controller';
import type { ReaderViewMode } from '@/application/reader-types';
import type { CSSProperties } from 'react';

type ReaderProps = { branding?: ReaderBranding; mode?: ReaderViewMode; page?: number; slug: string; surface: 'reader' | 'embed'; theme?: ReaderEmbedConfiguration };
const BIBLIOTECA_LOGO_URL = 'https://biblioteca-de-zines.com.br/logo.png';

export function Reader({ slug, surface, branding = 'none', theme, mode = '2up', page = 1 }: ReaderProps) {
  const { data, fallback, state, target } = useReaderController({ mode, page, slug, surface });

  if (state === 'fallback') return <Fallback branding={branding} fallback={fallback} surface={surface} theme={theme} title={data?.publication.title ?? slug} />;
  return <main className={`reader${surface === 'embed' ? ' reader--embed' : ''}`} style={theme ? { '--reader-background': theme.background, '--reader-text': theme.text } as CSSProperties : undefined}>{branding === 'biblioteca' && <ReaderBrand logoUrl={BIBLIOTECA_LOGO_URL} />} {state === 'loading' && <p aria-live="polite" className="reader__loading">Carregando leitor...</p>}<div aria-label={`Leitor de ${data?.publication.title ?? slug}`} className="reader__canvas" ref={target} /></main>;
}

function Fallback({ branding, fallback, surface, theme, title }: { branding: ReaderBranding; fallback: { label: string; url: string }; surface: 'reader' | 'embed'; theme?: ReaderEmbedConfiguration; title: string }) {
  return <main className={`reader${surface === 'embed' ? ' reader--embed' : ''}`} style={theme ? { '--reader-background': theme.background, '--reader-text': theme.text } as CSSProperties : undefined}>{branding === 'biblioteca' && <ReaderBrand logoUrl={BIBLIOTECA_LOGO_URL} />}<section className="reader__fallback"><p role="alert">A leitura em páginas não pôde ser carregada.</p>{fallback.url ? <a href={fallback.url} rel="noreferrer">{fallback.label}: {title}</a> : <p>O PDF original não está disponível.</p>}</section></main>;
}

function ReaderBrand({ logoUrl }: { logoUrl: string }) {
  return <header className="reader__brand"><img alt="Biblioteca de Zines" src={logoUrl} /></header>;
}
