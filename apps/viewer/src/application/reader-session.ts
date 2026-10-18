import type { ReaderFallbackLink, ReaderPageManifest } from '@biblioteca-de-zines/reader';
import { normalizeReaderPage, type ReaderRenderer, type ReaderSession, type ReaderSessionState } from './reader-types';

type ReaderSessionInput = { manifest?: ReaderPageManifest; fallback: ReaderFallbackLink; initialPage?: number };

export function createReaderSession(input: ReaderSessionInput, renderer: ReaderRenderer): ReaderSession {
  let state: ReaderSessionState = input.manifest
    ? { status: 'ready', manifest: input.manifest, currentPage: normalizeReaderPage(input.initialPage ?? input.manifest.pages[0].pageNumber, input.manifest.pageCount) }
    : { status: 'fallback', fallback: input.fallback, reason: 'page-generation-unavailable' };
  let mounted = false;
  let mounting = false;
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
    mount: (target) => {
      if (destroyed || mounted || state.status !== 'ready') return;
      mounting = true;
      try {
        renderer.mount(target, state.manifest, onPageChanged, () => session.useFallback('reader-failure'));
        if (state.status === 'ready' && !destroyed) mounted = true;
      } catch (error) {
        renderer.destroy();
        throw error;
      } finally {
        mounting = false;
      }
    },
    next: () => { if (mounted && state.status === 'ready') renderer.next(); },
    previous: () => { if (mounted && state.status === 'ready') renderer.previous(); },
    goTo: (page) => { if (mounted && state.status === 'ready') renderer.goTo(page); },
    useFallback: (reason = 'user-selected') => {
      if (destroyed || state.status === 'fallback') return;
      if (mounted || mounting) renderer.destroy();
      mounted = false;
      publish({ status: 'fallback', fallback: input.fallback, reason });
    },
    destroy: () => {
      if (destroyed) return;
      if (mounted || mounting) renderer.destroy();
      mounted = false;
      destroyed = true;
      listeners.clear();
    },
  };

  return session;
}
