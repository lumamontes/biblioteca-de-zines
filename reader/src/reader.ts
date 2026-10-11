import type {
  PublicationRepresentation,
  ReaderBoundary,
  ReaderDependencies,
  ReaderDocument,
  ReaderInput,
  ReaderLayout,
  ReaderMode,
  ReaderPage,
  ReaderPageSurface,
  ReaderStatus,
} from './contract';

const initialState = (input: ReaderInput): ReaderStatus => ({
  status: 'loading',
  metadata: input.metadata,
});

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function validate(input: ReaderInput, document: ReaderDocument): readonly ReaderPage[] {
  if (!document.pages.length) throw new Error('The publication has no pages.');
  return document.pages.map((page, index) => ({ ...page, index }));
}

function validateProvider(input: ReaderInput): void {
  const expectedKind = input.configuration.provider === 'direct-pdf' ? 'pdf' : 'image-pages';
  if (input.publication.kind !== expectedKind) {
    throw new Error(
      `Provider ${input.configuration.provider} cannot load ${input.publication.kind} publications.`,
    );
  }
}

function visibleIndexes(pageCount: number, currentPage: number, layout: ReaderLayout, wideViewport: boolean): number[] {
  if (layout === 'single-page' || (!wideViewport && layout === 'responsive') || pageCount < 2) {
    return [currentPage];
  }
  if (currentPage === 0 || currentPage === pageCount - 1) return [currentPage];

  const firstInterior = currentPage % 2 === 0 ? currentPage - 1 : currentPage;
  const secondInterior = firstInterior + 1;
  return secondInterior < pageCount - 1 ? [firstInterior, secondInterior] : [firstInterior];
}

export function createReader(input: ReaderInput, dependencies: ReaderDependencies): ReaderBoundary {
  let state = initialState(input);
  let destroyed = false;
  const listeners = new Set<(nextState: ReaderStatus) => void>();
  const activeSurfacePages = new Set<number>();
  let surfaceRequest = 0;

  const publish = (nextState: ReaderStatus) => {
    if (destroyed) return;
    state = nextState;
    listeners.forEach((listener) => listener(state));
  };

  const readyState = (): Extract<ReaderStatus, { status: 'ready' }> | undefined =>
    state.status === 'ready' ? state : undefined;

  const setMode = (mode: ReaderMode) => {
    const ready = readyState();
    if (ready) publish({ ...ready, mode });
  };

  const prepareSurfaces = async (currentPage: number): Promise<void> => {
    const ready = readyState();
    if (!ready) return;
    const request = ++surfaceRequest;
    const first = Math.max(0, currentPage - 1);
    const last = Math.min(ready.pageCount - 1, currentPage + 1);
    const retained = Array.from({ length: last - first + 1 }, (_, offset) => first + offset);
    const surface = dependencies.pageSurface;

    try {
      if (surface) {
        for (const index of retained) {
          if (!activeSurfacePages.has(index)) {
            await surface.load(ready.pages[index]);
            if (request !== surfaceRequest || destroyed) {
              surface.release(ready.pages[index]);
              return;
            }
            activeSurfacePages.add(index);
          }
        }
        if (request !== surfaceRequest || destroyed) return;
        for (const index of ready.loadedPages) {
          if (!retained.includes(index) && activeSurfacePages.has(index)) {
            surface.release(ready.pages[index]);
            activeSurfacePages.delete(index);
          }
        }
      }
      if (request !== surfaceRequest || destroyed) return;
      const current = readyState();
      const loadedPagesChanged = current !== undefined &&
        (current.loadedPages.length !== retained.length ||
          current.loadedPages.some((index, offset) => index !== retained[offset]));
      if (loadedPagesChanged && current) {
        publish({ ...current, loadedPages: retained });
      }
    } catch (error) {
      if (request === surfaceRequest) {
        if (surface) {
          activeSurfacePages.forEach((index) => surface.release(ready.pages[index]));
          activeSurfacePages.clear();
        }
        publish({
          status: 'failure',
          metadata: input.metadata,
          message: errorMessage(error),
          fallback: input.fallback,
        });
      }
    }
  };

  const goTo = (page: number) => {
    const ready = readyState();
    if (!ready) return;
    const currentPage = Math.max(0, Math.min(page, ready.pageCount - 1));
    publish({ ...ready, currentPage });
    void prepareSurfaces(currentPage);
  };

  const boundary: ReaderBoundary = {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load: async () => {
      const loader = dependencies[input.configuration.provider];
      if (!loader) {
        publish({
          status: 'failure',
          metadata: input.metadata,
          message: `No provider configured for ${input.configuration.provider}.`,
          fallback: input.fallback,
        });
        return state;
      }

      publish(initialState(input));
      try {
        validateProvider(input);
        const pages = validate(input, await loader(input.publication));
        publish({
          status: 'ready',
          metadata: input.metadata,
          mode: input.configuration.mode,
          layout: input.configuration.layout ?? 'responsive',
          pageCount: pages.length,
          currentPage: 0,
          pages,
          loadedPages: dependencies.pageSurface
            ? []
            : [0, ...(pages.length > 1 ? [1] : [])],
          representation: 'reading-derivative',
        });
        await prepareSurfaces(0);
      } catch (error) {
        publish({
          status: 'failure',
          metadata: input.metadata,
          message: errorMessage(error),
          fallback: input.fallback,
        });
      }
      return state;
    },
    setMode,
    goTo,
    next: () => {
      const ready = readyState();
      if (ready) goTo(ready.currentPage + 1);
    },
    previous: () => {
      const ready = readyState();
      if (ready) goTo(ready.currentPage - 1);
    },
    getVisiblePages: (wideViewport) => {
      const ready = readyState();
      if (!ready) return [];
      return visibleIndexes(ready.pageCount, ready.currentPage, ready.layout, wideViewport).map(
        (index) => ready.pages[index],
      );
    },
    useFallback: () => {
      publish({
        status: 'fallback',
        metadata: input.metadata,
        fallback: input.fallback,
        reason: state.status === 'failure' ? state.message : undefined,
      });
    },
    destroy: () => {
      surfaceRequest += 1;
      const ready = readyState();
      if (ready && dependencies.pageSurface) {
        activeSurfacePages.forEach((index) => dependencies.pageSurface?.release(ready.pages[index]));
        activeSurfacePages.clear();
      }
      destroyed = true;
      listeners.clear();
    },
  };

  return boundary;
}

export function imagePagesLoader(
  publication: PublicationRepresentation,
): Promise<ReaderDocument> {
  if (publication.kind !== 'image-pages') {
    return Promise.reject(new Error('The ordered-images provider requires image pages.'));
  }
  return Promise.resolve({
    pages: publication.pages.map((page, index) => ({ ...page, index })),
  });
}

/** Browser adapter for external image derivatives; the reader core remains DOM-free. */
export function imagePageSurface(): ReaderPageSurface {
  const images = new Map<number, HTMLImageElement>();
  return {
    load: (page) => new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        images.set(page.index, image);
        resolve();
      };
      image.onerror = () => reject(new Error(`Unable to load page image ${page.index + 1}.`));
      image.src = page.url;
    }),
    release: (page) => {
      const image = images.get(page.index);
      if (!image) return;
      image.onload = null;
      image.onerror = null;
      image.src = '';
      images.delete(page.index);
    },
  };
}
