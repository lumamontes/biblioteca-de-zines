import type { ReaderPageManifest } from '../../domain/reader/page-manifest';

export type ReaderRenderTarget = unknown;

export type ReaderFallback = {
  url: string;
  label: string;
};

export type ReaderReadyState = {
  status: 'ready';
  manifest: ReaderPageManifest;
  currentPage: number;
};

export type ReaderFallbackState = {
  status: 'fallback';
  fallback: ReaderFallback;
  reason: 'page-generation-unavailable' | 'reader-failure' | 'user-selected';
};

export type ReaderSessionState = ReaderReadyState | ReaderFallbackState;

export type ReaderRenderer = {
  mount: (
    target: ReaderRenderTarget,
    manifest: ReaderPageManifest,
    onPageChanged: (pageNumber: number) => void,
  ) => void;
  next: () => void;
  previous: () => void;
  goTo: (pageNumber: number) => void;
  destroy: () => void;
};

export type ReaderSession = {
  getState: () => ReaderSessionState;
  subscribe: (listener: (state: ReaderSessionState) => void) => () => void;
  mount: (target: ReaderRenderTarget) => void;
  next: () => void;
  previous: () => void;
  goTo: (pageNumber: number) => void;
  useFallback: (reason?: ReaderFallbackState['reason']) => void;
  destroy: () => void;
};

type ReaderSessionInput = {
  manifest?: ReaderPageManifest;
  fallback: ReaderFallback;
};

export function createReaderSession(input: ReaderSessionInput, renderer: ReaderRenderer): ReaderSession {
  let state: ReaderSessionState = input.manifest
    ? { status: 'ready', manifest: input.manifest, currentPage: input.manifest.pages[0].pageNumber }
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

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    mount: (target) => {
      if (destroyed || mounted || state.status !== 'ready') return;
      renderer.mount(target, state.manifest, onPageChanged);
      mounted = true;
    },
    next: () => {
      if (mounted && state.status === 'ready') renderer.next();
    },
    previous: () => {
      if (mounted && state.status === 'ready') renderer.previous();
    },
    goTo: (pageNumber) => {
      if (mounted && state.status === 'ready') renderer.goTo(pageNumber);
    },
    useFallback: (reason = 'user-selected') => {
      if (destroyed || state.status === 'fallback') return;
      if (mounted) renderer.destroy();
      mounted = false;
      publish({ status: 'fallback', fallback: input.fallback, reason });
    },
    destroy: () => {
      if (destroyed) return;
      if (mounted) renderer.destroy();
      mounted = false;
      destroyed = true;
      listeners.clear();
    },
  };
}
