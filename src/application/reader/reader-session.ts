import { createPageManifest } from '../../domain/reader/page-manifest';
import type { ReaderPageManifest } from '../../domain/reader/page-manifest-types';
import type {
  ReaderFallback,
  ReaderFallbackState,
  ReaderRenderer,
  ReaderSession,
  ReaderSessionState,
} from './reader-contracts';
export type { ReaderFallback, ReaderFallbackState, ReaderRenderer, ReaderRenderTarget, ReaderSession, ReaderSessionState } from './reader-contracts';

type ReaderSessionInput = {
  /** The caller selects the active complete generation; the session never selects one. */
  manifest?: ReaderPageManifest;
  fallback: ReaderFallback;
};

export function createReaderSession(input: ReaderSessionInput, renderer: ReaderRenderer): ReaderSession {
  let manifest: ReaderPageManifest | undefined;
  try {
    if (input.manifest) manifest = createPageManifest(input.manifest);
  } catch {
    manifest = undefined;
  }
  let state: ReaderSessionState = manifest
    ? { status: 'ready', manifest, currentPage: manifest.pages[0].pageNumber }
    : { status: 'fallback', fallback: input.fallback, reason: 'page-generation-unavailable' };
  let mounted = false;
  let destroyed = false;
  const listeners = new Set<(nextState: ReaderSessionState) => void>();

  const publish = (nextState: ReaderSessionState) => {
    if (destroyed) return;
    state = nextState;
    listeners.forEach((listener) => listener(state));
  };

  const onPageChanged = (pageNumber: number) => {
    if (state.status !== 'ready') return;
    if (!state.manifest.pages.some((page) => page.pageNumber === pageNumber)) return;
    publish({ ...state, currentPage: pageNumber });
  };

  const switchToFallback = (reason: ReaderFallbackState['reason'] = 'user-selected') => {
    if (destroyed || state.status === 'fallback') return;
    try {
      if (mounted) renderer.destroy();
    } catch {
      // Adapter cleanup must not prevent the explicit PDF fallback.
    } finally {
      mounted = false;
      publish({ status: 'fallback', fallback: input.fallback, reason });
    }
  };

  const runRenderer = (operation: () => void) => {
    if (!mounted || state.status !== 'ready') return;
    try {
      operation();
    } catch {
      switchToFallback('reader-failure');
    }
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    mount: (target) => {
      if (destroyed || mounted || state.status !== 'ready') return;
      mounted = true;
      try {
        renderer.mount(target, state.manifest, onPageChanged, () => switchToFallback('reader-failure'));
      } catch {
        switchToFallback('reader-failure');
      }
    },
    next: () => runRenderer(() => renderer.next()),
    previous: () => runRenderer(() => renderer.previous()),
    goTo: (pageNumber) => runRenderer(() => renderer.goTo(pageNumber)),
    useFallback: switchToFallback,
    destroy: () => {
      if (destroyed) return;
      if (mounted) {
        try {
          renderer.destroy();
        } catch {
          // Cleanup is best effort; the session still becomes unusable.
        } finally {
          mounted = false;
        }
      }
      destroyed = true;
      listeners.clear();
    },
  };
}
