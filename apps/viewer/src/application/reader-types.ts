import type { ReaderPageManifest } from '@biblioteca-de-zines/reader-contracts';

export type ReaderViewMode = '1up' | '2up';
export type ReaderRenderTarget = HTMLElement;

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
  | { status: 'fallback'; fallback: { label: string; url: string }; reason: 'page-generation-unavailable' | 'reader-failure' | 'user-selected' };

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
