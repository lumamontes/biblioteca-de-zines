'use client';

import { useEffect, useRef, useState } from 'react';
import { createReaderSession } from '@/application/reader-session';
import { createBookReaderRenderer, loadBookReaderRuntime } from '@/infrastructure/bookreader-adapter';
import { createReaderRequestController, fetchPublicReader } from '@/infrastructure/public-reader-client';
import { createReaderTelemetry } from '@/infrastructure/reader-telemetry';
import { DEFAULT_READER_FALLBACK } from './reader-controller-config';
import type { ReaderControllerInput, ReaderControllerResult, ReaderControllerState } from './reader-controller-types';

const apiOrigin = process.env.NEXT_PUBLIC_READER_API_ORIGIN ?? 'https://www.biblioteca-de-zines.com.br';
const INITIAL_READER_STATE: ReaderControllerState = { fallback: DEFAULT_READER_FALLBACK, state: 'loading' };

export type { ReaderControllerInput, ReaderControllerResult, ReaderControllerState } from './reader-controller-types';

export function useReaderController({ mode, page, slug, surface }: ReaderControllerInput): ReaderControllerResult {
  const target = useRef<HTMLDivElement>(null);
  const [readerState, setReaderState] = useState(INITIAL_READER_STATE);

  useEffect(() => {
    let disposed = false;
    let destroySession = () => {};
    const request = createReaderRequestController();
    const telemetry = createReaderTelemetry(apiOrigin, slug, surface);

    setReaderState(INITIAL_READER_STATE);

    async function loadReader() {
      try {
        const { data, metadataBytes } = await fetchPublicReader(apiOrigin, slug, surface, request.signal).finally(request.cancel);
        if (disposed) return;

        setReaderState({
          fallback: data.fallback,
          publication: data.publication,
          state: data.status === 'ready' ? 'loading' : 'fallback',
        });

        if (data.status === 'fallback') {
          telemetry.report('fallback', { metadataBytes });
          return;
        }

        await loadBookReaderRuntime();
        if (disposed || !target.current) return;

        const session = createReaderSession(
          { fallback: data.fallback, initialPage: page, manifest: data.manifest },
          createBookReaderRenderer(undefined, { mode, page }),
        );
        const unsubscribe = session.subscribe((next) => {
          setReaderState((current) => ({ ...current, state: next.status }));
        });
        destroySession = () => {
          unsubscribe();
          session.destroy();
        };

        session.mount(target.current);
        setReaderState((current) => ({ ...current, state: session.getState().status }));
        telemetry.report('page-load', { metadataBytes });
        telemetry.ready();
      } catch {
        destroySession();
        telemetry.report('page-error');
        if (!disposed) setReaderState((current) => ({ ...current, state: 'fallback' }));
      }
    }

    void loadReader();
    return () => {
      disposed = true;
      request.cancel();
      destroySession();
    };
  }, [mode, page, slug, surface]);

  return {
    ...readerState,
    target,
  };
}
