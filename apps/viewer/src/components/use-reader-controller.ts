'use client';

import { useEffect, useRef, useState } from 'react';
import { createReaderSession } from '@/application/reader-session';
import { createBookReaderRenderer, loadBookReaderRuntime } from '@/infrastructure/bookreader-adapter';
import { createReaderRequestController, fetchPublicReader } from '@/infrastructure/public-reader-client';
import { createReaderTelemetry } from '@/infrastructure/reader-telemetry';
import type { ReaderControllerInput, ReaderControllerState } from './reader-controller-types';

const apiOrigin = process.env.NEXT_PUBLIC_READER_API_ORIGIN ?? 'https://www.biblioteca-de-zines.com.br';

export function useReaderController({ mode, page, slug, surface }: ReaderControllerInput): ReaderControllerState {
  const target = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ReaderControllerState['state']>('loading');
  const [publication, setPublication] = useState<ReaderControllerState['publication']>();
  const [fallback, setFallback] = useState<ReaderControllerState['fallback']>({ label: 'Abrir a publicação', url: '' });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    let cancelRequest = () => {};
    let session: ReturnType<typeof createReaderSession> | undefined;
    let hasValidReaderData = false;
    setState('loading');
    setPublication(undefined);
    setFallback({ label: 'Abrir a publicação', url: '' });
    const telemetry = createReaderTelemetry(apiOrigin, slug, surface);

    async function load() {
      try {
        const request = createReaderRequestController();
        cancelRequest = request.cancel;
        const { data: parsed, metadataBytes } = await fetchPublicReader(apiOrigin, slug, surface, request.signal).finally(request.cancel);
        if (disposed) return;
        setPublication(parsed.publication);
        setFallback(parsed.fallback);
        if (parsed.status === 'fallback') {
          telemetry.report('fallback', { metadataBytes });
          setState(parsed.reason === 'source-unavailable' ? 'unavailable' : 'fallback');
          return;
        }
        hasValidReaderData = true;
        await loadBookReaderRuntime();
        if (disposed) return;
        session = createReaderSession({ fallback: parsed.fallback, initialPage: page, manifest: parsed.manifest }, createBookReaderRenderer(undefined, { mode, page }));
        const unsubscribe = session.subscribe((next) => {
          setState(next.status);
        });
        if (!target.current) {
          session.destroy();
          return;
        }
        session.mount(target.current);
        setState(session.getState().status);
        telemetry.report('page-load', { metadataBytes });
        telemetry.ready();
        cleanup = () => { unsubscribe(); session?.destroy(); };
      } catch {
        session?.destroy();
        telemetry.report('page-error');
        if (!disposed) setState(hasValidReaderData ? 'fallback' : 'unavailable');
      }
    }

    void load();
    return () => { disposed = true; cancelRequest(); cleanup(); };
  }, [mode, page, retryKey, slug, surface]);

  return { fallback, publication, retry: () => setRetryKey((current) => current + 1), state, target };
}
