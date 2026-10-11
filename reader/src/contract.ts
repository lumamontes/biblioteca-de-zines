export type PublicationRepresentation =
  | { kind: 'pdf'; url: string }
  | { kind: 'image-pages'; pages: readonly ImagePage[] };

export type ImagePage = {
  url: string;
  alt?: string;
};

/** Page images are delivery derivatives, never claims about the retained original. */
export type ReaderRepresentation = 'reading-derivative';

export type ReaderMode = 'page-turn' | 'slide';
export type ReaderLayout = 'responsive' | 'single-page' | 'spread';
export type ReaderProvider = 'direct-pdf' | 'ordered-images';

export type PublicationMetadata = {
  title: string;
  creator?: string;
  description?: string;
};

export type StandardViewerFallback = {
  url: string;
  label?: string;
};

export type ReaderConfiguration = {
  provider: ReaderProvider;
  mode: ReaderMode;
  layout?: ReaderLayout;
};

export type ReaderInput = {
  publication: PublicationRepresentation;
  configuration: ReaderConfiguration;
  metadata: PublicationMetadata;
  fallback: StandardViewerFallback;
};

export type ReaderPage = ImagePage & { index: number };

export type ReaderDocument = {
  pages: readonly ReaderPage[];
};

export type ReaderStatus =
  | { status: 'loading'; metadata: PublicationMetadata }
  | {
      status: 'ready';
      metadata: PublicationMetadata;
      mode: ReaderMode;
      layout: ReaderLayout;
      pageCount: number;
      currentPage: number;
      pages: readonly ReaderPage[];
      loadedPages: readonly number[];
      representation: ReaderRepresentation;
    }
  | {
      status: 'failure';
      metadata: PublicationMetadata;
      message: string;
      fallback: StandardViewerFallback;
    }
  | {
      status: 'fallback';
      metadata: PublicationMetadata;
      fallback: StandardViewerFallback;
      reason?: string;
    };

export type ReaderLoader = (
  publication: PublicationRepresentation,
) => Promise<ReaderDocument>;

export type ReaderPageSurface = {
  load(page: ReaderPage): Promise<void>;
  release(page: ReaderPage): void;
};

export type ReaderDependencies = Partial<Record<ReaderProvider, ReaderLoader>> & {
  pageSurface?: ReaderPageSurface;
};

export type ReaderBoundary = {
  getState(): ReaderStatus;
  subscribe(listener: (state: ReaderStatus) => void): () => void;
  load(): Promise<ReaderStatus>;
  setMode(mode: ReaderMode): void;
  goTo(page: number): void;
  next(): void;
  previous(): void;
  getVisiblePages(wideViewport: boolean): readonly ReaderPage[];
  useFallback(): void;
  destroy(): void;
};
