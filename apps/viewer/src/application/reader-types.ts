import type { ReaderDeliveryMode, ReaderFallbackLink, ReaderPageManifest } from '@biblioteca-de-zines/reader';

export type ReaderViewMode = '1up' | '2up';
export type { ReaderDeliveryMode };
export type ReaderRenderTarget = object;

export function normalizeReaderPage(page: number, pageCount: number): number {
  if (!Number.isFinite(page)) return 1;
  return Math.min(pageCount, Math.max(1, Math.trunc(page)));
}

export type ReaderRenderer = {
  mount: (
    target: ReaderRenderTarget,
    manifest: ReaderPageManifest,
    onPageChanged: (page: number) => void,
    onError?: () => void,
  ) => void;
  next: () => void;
  previous: () => void;
  goTo: (page: number) => void;
  destroy: () => void;
};

export type ReaderSessionState =
  | { status: 'ready'; manifest: ReaderPageManifest; currentPage: number }
  | { status: 'fallback'; fallback: ReaderFallbackLink; reason: 'page-generation-unavailable' | 'reader-failure' | 'user-selected' };

export type ReaderSession = {
  getState: () => ReaderSessionState;
  subscribe: (listener: (state: ReaderSessionState) => void) => () => void;
  mount: (target: ReaderRenderTarget) => void;
  next: () => void;
  previous: () => void;
  goTo: (page: number) => void;
  useFallback: (reason?: 'reader-failure' | 'user-selected') => void;
  destroy: () => void;
};
