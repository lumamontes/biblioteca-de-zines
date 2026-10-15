import type { ReaderPageManifest } from '@/domain/reader/page-manifest-types';
import type { ReaderFallback, ReaderFallbackState, ReaderRenderer, ReaderSession, ReaderSessionState, ReaderRenderTarget } from './reader-contracts';

type ReaderSessionInput = { manifest?: ReaderPageManifest; fallback: ReaderFallback };

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
    if (state.status !== 'ready' || !state.manifest.pages.some((page) => page.pageNumber === pageNumber)) return;
    publish({ ...state, currentPage: pageNumber });
  };

  const session: ReaderSession = {
    getState: () => state,
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    mount: (target: ReaderRenderTarget) => {
      if (destroyed || mounted || state.status !== 'ready') return;
      renderer.mount(target, state.manifest, onPageChanged, () => session.useFallback('reader-failure'));
      mounted = true;
    },
    next: () => { if (mounted && state.status === 'ready') renderer.next(); },
    previous: () => { if (mounted && state.status === 'ready') renderer.previous(); },
    goTo: (pageNumber) => { if (mounted && state.status === 'ready') renderer.goTo(pageNumber); },
    useFallback: (reason: ReaderFallbackState['reason'] = 'user-selected') => {
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
  return session;
}
