'use client';

import { createReaderSession, parsePublicReaderResponse, type PublicReaderResponse } from '@biblioteca/reader-contracts';
import { useEffect, useRef, useState } from 'react';
import { createBookReaderRenderer, loadBookReaderRuntime } from '@/infrastructure/bookreader-adapter';

const apiOrigin = process.env.NEXT_PUBLIC_READER_API_ORIGIN ?? 'https://biblioteca-de-zines.com.br';

export function Reader({ slug, surface, branding = false }: { slug: string; surface: 'reader' | 'embed'; branding?: boolean }) {
  const target = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [data, setData] = useState<Extract<PublicReaderResponse, { status: 'ready' }>>();
  const [fallback, setFallback] = useState<{ label: string; url: string }>({ label: 'Abrir a publicação', url: '' });

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    async function load() {
      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 10000);
        const response = await fetch(`${apiOrigin.replace(/\/$/, '')}/api/public-reader/v1/${encodeURIComponent(slug)}?surface=${surface}`, {
          credentials: 'omit',
          cache: 'no-store',
          signal: controller.signal,
        }).finally(() => window.clearTimeout(timeout));
        if (!response.ok) throw new Error('Reader API unavailable');
        const parsed = parsePublicReaderResponse(await response.json());
        if (disposed) return;
        setFallback(parsed.fallback);
        if (parsed.status === 'fallback') { setState('fallback'); return; }
        setData(parsed);
        await loadBookReaderRuntime();
        if (disposed) return;
        const session = createReaderSession({ fallback: parsed.fallback, manifest: parsed.manifest }, createBookReaderRenderer());
        const unsubscribe = session.subscribe((next) => setState(next.status));
        if (!target.current) return;
        session.mount(target.current);
        setState(session.getState().status);
        cleanup = () => { unsubscribe(); session.destroy(); };
      } catch {
        if (!disposed) setState('fallback');
      }
    }
    void load();
    return () => { disposed = true; cleanup(); };
  }, [slug, surface]);

  if (state === 'loading') return <main className={branding ? 'reader reader--branded' : 'reader'}><p className="reader__loading">Carregando leitor...</p></main>;
  if (state === 'fallback') return <Fallback branding={branding} fallback={fallback} title={data?.publication.title ?? slug} />;
  return <main className={branding ? 'reader reader--branded' : 'reader'}><div aria-label={`Leitor de ${data?.publication.title ?? slug}`} className="reader__canvas" ref={target} /></main>;
}

function Fallback({ branding, fallback, title }: { branding: boolean; fallback: { label: string; url: string }; title: string }) {
  return <main className={branding ? 'reader reader--branded' : 'reader'}><section className="reader__fallback"><p role="alert">A leitura em páginas não pôde ser carregada.</p>{fallback.url ? <a href={fallback.url} rel="noreferrer">{fallback.label}: {title}</a> : <p>O PDF original não está disponível.</p>}</section></main>;
}
