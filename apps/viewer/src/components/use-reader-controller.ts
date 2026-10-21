'use client';

import { useEffect, useRef, useState } from 'react';
import { createReaderSession } from '@/application/reader-session';
import type { ReaderDeliveryMode, ReaderViewMode } from '@/application/reader-types';
import { createBookReaderRenderer, loadBookReaderRuntime } from '@/infrastructure/bookreader-adapter';
import { fetchPublicReader } from '@/infrastructure/public-reader-client';
import { createReaderTelemetry } from '@/infrastructure/reader-telemetry';
import type { PublicReaderZine } from '@biblioteca-de-zines/reader';

const apiOrigin = process.env.NEXT_PUBLIC_READER_API_ORIGIN ?? 'https://www.biblioteca-de-zines.com.br';

export type ReaderControllerInput = { mode: ReaderViewMode; page: number; slug: string; surface: ReaderDeliveryMode };
export type ReaderControllerState = {
  publication?: PublicReaderZine;
  fallback: { label: string; url: string };
  state: 'loading' | 'ready' | 'fallback';
  target: React.RefObject<HTMLDivElement | null>;
};

export function useReaderController({ mode, page, slug, surface }: ReaderControllerInput): ReaderControllerState {
  const target = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ReaderControllerState['state']>('loading');
  const [publication, setPublication] = useState<ReaderControllerState['publication']>();
  const [fallback, setFallback] = useState<ReaderControllerState['fallback']>({ label: 'Abrir a publicação', url: '' });

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    let session: ReturnType<typeof createReaderSession> | undefined;
    setState('loading');
    setPublication(undefined);
    setFallback({ label: 'Abrir a publicação', url: '' });
    const telemetry = createReaderTelemetry(apiOrigin, slug, surface);

    async function load() {
      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 10000);
        const { data: parsed, metadataBytes } = await fetchPublicReader(apiOrigin, slug, surface, controller.signal).finally(() => window.clearTimeout(timeout));
        if (disposed) return;
        setPublication(parsed.publication);
        setFallback(parsed.fallback);
        if (parsed.status === 'fallback') {
          telemetry.report('fallback', { metadataBytes });
          setState('fallback');
          return;
        }
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
        if (!disposed) setState('fallback');
      }
    }

    void load();
    return () => { disposed = true; cleanup(); };
  }, [mode, page, slug, surface]);

  return { fallback, publication, state, target };
}
