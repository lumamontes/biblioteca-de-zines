'use client';

import { parsePublicReaderResponse, type PublicReaderResponse } from '@biblioteca-de-zines/reader-contracts';
import { useEffect, useRef, useState } from 'react';
import { createReaderSession } from '@/application/reader-session';
import type { ReaderViewMode } from '@/application/reader-types';
import { createBookReaderRenderer, loadBookReaderRuntime } from '@/infrastructure/bookreader-adapter';

const apiOrigin = process.env.NEXT_PUBLIC_READER_API_ORIGIN ?? 'https://biblioteca-de-zines.com.br';

export type ReaderControllerInput = { mode: ReaderViewMode; page: number; slug: string; surface: 'reader' | 'embed' };
export type ReaderControllerState = {
  data?: Extract<PublicReaderResponse, { status: 'ready' }>;
  fallback: { label: string; url: string };
  state: 'loading' | 'ready' | 'fallback';
  target: React.RefObject<HTMLDivElement | null>;
};

export function useReaderController({ mode, page, slug, surface }: ReaderControllerInput): ReaderControllerState {
  const target = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ReaderControllerState['state']>('loading');
  const [data, setData] = useState<ReaderControllerState['data']>();
  const [fallback, setFallback] = useState<ReaderControllerState['fallback']>({ label: 'Abrir a publicação', url: '' });

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    const startedAt = performance.now();
    const report = (type: 'fallback' | 'page-error' | 'page-load' | 'ready', extras: Record<string, number | string> = {}) => {
      void fetch(`${apiOrigin.replace(/\/$/, '')}/api/public-reader/events`, {
        body: JSON.stringify({ durationMs: Math.max(0, Math.round(performance.now() - startedAt)), slug, surface, type, ...extras }),
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
        const session = createReaderSession({ fallback: parsed.fallback, manifest: parsed.manifest }, createBookReaderRenderer(undefined, { mode, page }));
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
  }, [mode, page, slug, surface]);

  return { data, fallback, state, target };
}

function collectPerformanceMetrics(origin: string): Record<string, number | string> {
  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const apiEntries = entries.filter((entry) => entry.name.startsWith(origin));
  const bundleBytes = entries
    .filter((entry) => entry.name.includes('cdn.jsdelivr.net') && entry.name.endsWith('.js'))
    .reduce((total, entry) => total + (entry.transferSize || entry.encodedBodySize || 0), 0);
  const derivativeEntries = entries.filter((entry) => /\.(?:webp|jpg|jpeg|png)(?:\?|$)/i.test(entry.name));
  const derivativeBandwidthBytes = derivativeEntries.reduce((total, entry) => total + (entry.transferSize || entry.encodedBodySize || 0), 0);
  const cacheBehavior = derivativeEntries.length === 0 ? 'unknown' : derivativeEntries.some((entry) => entry.transferSize === 0) ? 'hit' : 'miss';
  const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;

  return { requestCount: apiEntries.length + derivativeEntries.length, bundleBytes, derivativeBandwidthBytes, cacheBehavior, ...(memory === undefined ? {} : { memoryBytes: memory }) };
}
