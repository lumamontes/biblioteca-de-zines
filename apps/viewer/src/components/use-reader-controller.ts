'use client';

import { useEffect, useRef, useState } from 'react';
import { createReaderSession } from '@/application/reader-session';
import { createBookReaderRenderer, loadBookReaderRuntime } from '@/infrastructure/bookreader-adapter';
import { createReaderRequestController, fetchPublicReader } from '@/infrastructure/public-reader-client';
import { createReaderTelemetry } from '@/infrastructure/reader-telemetry';
import { INITIAL_READER_STATE, READER_API_ORIGIN } from './reader-controller.config';
import type { ReaderControllerInput, ReaderControllerResult, ReaderControllerState } from './reader-controller.types';

export type { ReaderControllerInput, ReaderControllerResult, ReaderControllerState } from './reader-controller.types';

export function useReaderController({ mode, page, slug, surface }: ReaderControllerInput): ReaderControllerResult {
  const target = useRef<HTMLDivElement>(null);
  const [readerState, setReaderState] = useState(INITIAL_READER_STATE);

  useEffect(() => {
    let disposed = false;
    let destroySession = () => {};
    const request = createReaderRequestController();
    let publicationSlug = slug;
    const telemetry = createReaderTelemetry(READER_API_ORIGIN, () => publicationSlug, surface);

    setReaderState(INITIAL_READER_STATE);

    let reportedFailure = false;
    let hasOriginal = false;
    function reportFailure(metadataBytes?: number) {
      if (disposed || reportedFailure) return;
      reportedFailure = true;
      const metrics = metadataBytes === undefined ? undefined : { metadataBytes };
      telemetry.report('page-error', metrics);
      if (hasOriginal) telemetry.report('fallback', metrics);
    }

    async function loadReader() {
      try {
        const { data, metadataBytes } = await fetchPublicReader(READER_API_ORIGIN, slug, surface, request.signal).finally(request.cancel);
        if (disposed) return;

        publicationSlug = data.publication?.slug ?? slug;
        hasOriginal = Boolean(data.fallback.url);
        setReaderState({
          fallback: data.fallback,
          publication: data.publication,
          state: data.status === 'ready' ? 'loading' : 'fallback',
        });

        if (data.status === 'fallback') {
          if (data.reason === 'page-generation-unavailable') {
            if (hasOriginal) telemetry.report('fallback', { metadataBytes });
          } else {
            reportFailure(metadataBytes);
          }
          return;
        }

        await loadBookReaderRuntime();
        if (disposed || !target.current) return;

        const session = createReaderSession(
          { fallback: data.fallback, initialPage: page, manifest: data.manifest },
          createBookReaderRenderer(undefined, { mode, page }),
        );
        const unsubscribe = session.subscribe((next) => {
          if (next.status === 'fallback') reportFailure();
          setReaderState((current) => ({ ...current, state: next.status }));
        });
        destroySession = () => {
          unsubscribe();
          session.destroy();
        };

        session.mount(target.current);
        setReaderState((current) => ({ ...current, state: session.getState().status }));
        if (session.getState().status !== 'ready') return;
        telemetry.report('page-load', { metadataBytes });
        telemetry.ready();
      } catch {
        destroySession();
        reportFailure();
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
