import type { ReaderPageManifest } from '@/domain/reader/page-manifest-types';

export type ReaderRenderTarget = unknown;
export type ReaderFallback = { url: string; label: string };
export type ReaderReadyState = { status: 'ready'; manifest: ReaderPageManifest; currentPage: number };
export type ReaderFallbackState = {
  status: 'fallback';
  fallback: ReaderFallback;
  reason: 'incomplete-page-generation' | 'page-generation-failed' | 'page-generation-unavailable' | 'reader-failure' | 'source-unavailable' | 'user-selected';
};
export type ReaderSessionState = ReaderReadyState | ReaderFallbackState;

export type ReaderRenderer = {
  mount: (target: ReaderRenderTarget, manifest: ReaderPageManifest, onPageChanged: (pageNumber: number) => void, onError?: () => void) => void;
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
