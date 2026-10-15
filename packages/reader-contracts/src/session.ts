import type { ReaderFallback, ReaderPageManifest, ReaderRenderer } from './index';

export type ReaderSessionState =
  | { status: 'ready'; manifest: ReaderPageManifest; currentPage: number }
  | { status: 'fallback'; fallback: ReaderFallback; reason: 'page-generation-unavailable' | 'reader-failure' | 'user-selected' };

export function createReaderSession(input: { manifest?: ReaderPageManifest; fallback: ReaderFallback }, renderer: ReaderRenderer) {
  let state: ReaderSessionState = input.manifest
    ? { status: 'ready', manifest: input.manifest, currentPage: 1 }
    : { status: 'fallback', fallback: input.fallback, reason: 'page-generation-unavailable' };
  let mounted = false;
  let destroyed = false;
  const listeners = new Set<(state: ReaderSessionState) => void>();
  const publish = (next: ReaderSessionState) => {
    if (destroyed) return;
    state = next;
    listeners.forEach((listener) => listener(state));
  };
  const onPageChanged = (page: number) => {
    if (state.status === 'ready' && state.manifest.pages.some((item) => item.pageNumber === page)) publish({ ...state, currentPage: page });
  };
  return {
    getState: () => state,
    subscribe: (listener: (state: ReaderSessionState) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    mount: (target: unknown) => {
      if (destroyed || mounted || state.status !== 'ready') return;
      try {
        renderer.mount(target, state.manifest, onPageChanged, () => {
          publish({ status: 'fallback', fallback: input.fallback, reason: 'reader-failure' });
        });
        mounted = true;
      } catch {
        publish({ status: 'fallback', fallback: input.fallback, reason: 'reader-failure' });
      }
    },
    next: () => { if (mounted && state.status === 'ready') renderer.next(); },
    previous: () => { if (mounted && state.status === 'ready') renderer.previous(); },
    goTo: (page: number) => { if (mounted && state.status === 'ready') renderer.goTo(page); },
    useFallback: (reason: 'reader-failure' | 'user-selected' = 'user-selected') => {
      if (destroyed || state.status === 'fallback') return;
      if (mounted) renderer.destroy();
      mounted = false;
      publish({ status: 'fallback', fallback: input.fallback, reason });
    },
    destroy: () => {
      if (destroyed) return;
      if (mounted) renderer.destroy();
      destroyed = true;
      listeners.clear();
    },
  };
}
