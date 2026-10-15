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
    const startedAt = performance.now();
    const report = (type: 'fallback' | 'page-error' | 'page-load' | 'ready', extras: Record<string, number | string> = {}) => {
      void fetch(`${apiOrigin.replace(/\/$/, '')}/api/public-reader/events`, {
        body: JSON.stringify({
          durationMs: Math.max(0, Math.round(performance.now() - startedAt)),
          slug,
          surface,
          type,
          ...extras,
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        credentials: 'omit',
        keepalive: true,
      }).catch(() => undefined);
    };
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
        if (parsed.status === 'fallback') {
          report('fallback', { metadataBytes: Number(response.headers.get('content-length')) || 0 });
          setState('fallback');
          return;
        }
        setData(parsed);
        await loadBookReaderRuntime();
        if (disposed) return;
        const session = createReaderSession({ fallback: parsed.fallback, manifest: parsed.manifest }, createBookReaderRenderer());
        const unsubscribe = session.subscribe((next) => setState(next.status));
        if (!target.current) return;
        session.mount(target.current);
        setState(session.getState().status);
        report('page-load', { metadataBytes: Number(response.headers.get('content-length')) || 0 });
        report('ready', collectPerformanceMetrics(apiOrigin));
        cleanup = () => { unsubscribe(); session.destroy(); };
      } catch {
        report('page-error');
        if (!disposed) setState('fallback');
      }
    }
    void load();
    return () => { disposed = true; cleanup(); };
  }, [slug, surface]);

  if (state === 'fallback') return <Fallback branding={branding} fallback={fallback} title={data?.publication.title ?? slug} />;
  return <main className={branding ? 'reader reader--branded' : 'reader'}>{state === 'loading' && <p className="reader__loading">Carregando leitor...</p>}<div aria-label={`Leitor de ${data?.publication.title ?? slug}`} className="reader__canvas" ref={target} /></main>;
}

function collectPerformanceMetrics(apiOrigin: string): Record<string, number | string> {
  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const apiEntries = entries.filter((entry) => entry.name.startsWith(apiOrigin));
  const bundleBytes = entries
    .filter((entry) => entry.name.includes('cdn.jsdelivr.net') && entry.name.endsWith('.js'))
    .reduce((total, entry) => total + (entry.transferSize || entry.encodedBodySize || 0), 0);
  const derivativeEntries = entries.filter((entry) => /\.(?:webp|jpg|jpeg|png)(?:\?|$)/i.test(entry.name));
  const derivativeBandwidthBytes = derivativeEntries.reduce(
    (total, entry) => total + (entry.transferSize || entry.encodedBodySize || 0),
    0,
  );
  const cacheBehavior = derivativeEntries.length === 0
    ? 'unknown'
    : derivativeEntries.some((entry) => entry.transferSize === 0) ? 'hit' : 'miss';
  const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;

  return {
    requestCount: apiEntries.length + derivativeEntries.length,
    bundleBytes,
    derivativeBandwidthBytes,
    cacheBehavior,
    ...(memory === undefined ? {} : { memoryBytes: memory }),
  };
}

function Fallback({ branding, fallback, title }: { branding: boolean; fallback: { label: string; url: string }; title: string }) {
  return <main className={branding ? 'reader reader--branded' : 'reader'}><section className="reader__fallback"><p role="alert">A leitura em páginas não pôde ser carregada.</p>{fallback.url ? <a href={fallback.url} rel="noreferrer">{fallback.label}: {title}</a> : <p>O PDF original não está disponível.</p>}</section></main>;
}
