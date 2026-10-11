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

function validate(document: ReaderDocument): void {
  if (!Number.isInteger(document.pageCount) || document.pageCount < 1) {
    throw new Error('The publication has no pages.');
  }
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
  let document: ReaderDocument | undefined;
  const pages = new Map<number, ReaderPage>();
  const pending = new Map<number, Promise<ReaderPage>>();
  const activeSurfacePages = new Set<number>();
  let surfaceRequest = 0;

  const publish = (nextState: ReaderStatus) => {
    if (destroyed) return;
    state = nextState;
    listeners.forEach((listener) => listener(state));
  };

  const readyState = (): Extract<ReaderStatus, { status: 'ready' }> | undefined =>
    state.status === 'ready' ? state : undefined;

  const loadedPages = (): readonly ReaderPage[] =>
    [...pages.values()].sort((left, right) => left.index - right.index);

  const publishReady = (currentPage: number) => {
    if (!document) return;
    const current = readyState();
    publish({
      status: 'ready',
      metadata: input.metadata,
      mode: current?.mode ?? input.configuration.mode,
       layout: current?.layout ?? input.configuration.layout ?? 'responsive',
       pageCount: document.pageCount,
       currentPage,
       pages: loadedPages(),
       loadedPages: dependencies.pageSurface
         ? [...activeSurfacePages].sort((left, right) => left - right)
         : [...pages.keys()].sort((left, right) => left - right),
       representation: 'reading-derivative',
     });
  };

  const loadPage = (page: number): Promise<ReaderPage> => {
    const loaded = pages.get(page);
    if (loaded) return Promise.resolve(loaded);
    const existing = pending.get(page);
    if (existing) return existing;
    if (!document) return Promise.reject(new Error('The publication is not loaded.'));
    const request = document.loadPage(page).then((loadedPage) => {
      const normalized = { ...loadedPage, index: page };
      pages.set(page, normalized);
      pending.delete(page);
      if (destroyed) {
        pages.delete(page);
      }
      return normalized;
    }, (error) => {
      pending.delete(page);
      throw error;
    });
    pending.set(page, request);
    return request;
  };

  const warmAdjacent = (currentPage: number) => {
    [currentPage - 1, currentPage + 1]
      .filter((page) => page >= 0 && document && page < document.pageCount)
      .forEach((page) => {
        if (pages.has(page)) return;
        void loadPage(page).then(() => {
          if (state.status === 'ready') {
            evictDistant(state.currentPage);
            publishReady(state.currentPage);
          }
        }).catch((error) => {
          const ready = readyState();
          if (ready) {
            publish({
              status: 'page-failure',
              metadata: input.metadata,
              mode: ready.mode,
              layout: ready.layout,
              pageCount: ready.pageCount,
              currentPage: ready.currentPage,
              pages: loadedPages(),
              page,
              message: errorMessage(error),
              fallback: input.fallback,
            });
          }
        });
      });
  };

  const evictDistant = (currentPage: number) => {
    const retained = new Set([currentPage - 1, currentPage, currentPage + 1]);
    [...pages.keys()].forEach((index) => {
      if (retained.has(index)) return;
      const page = pages.get(index);
      if (page && activeSurfacePages.has(index)) dependencies.pageSurface?.release(page);
      activeSurfacePages.delete(index);
      pages.delete(index);
    });
  };

  const navigate = async (delta: number) => {
    const ready = readyState();
    if (!ready) return;
    const target = Math.max(0, Math.min(ready.currentPage + delta, ready.pageCount - 1));
    if (target === ready.currentPage) return;
    try {
      await loadPage(target);
      evictDistant(target);
      publishReady(target);
      if (dependencies.pageSurface) void prepareSurfaces(target);
      else warmAdjacent(target);
    } catch (error) {
      publish({
        status: 'page-failure',
        metadata: input.metadata,
        mode: ready.mode,
        layout: ready.layout,
        pageCount: ready.pageCount,
        currentPage: ready.currentPage,
        pages: loadedPages(),
        page: target,
        message: errorMessage(error),
        fallback: input.fallback,
      });
    }
  };

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
            const page = await loadPage(index);
            await surface.load(page);
            if (request !== surfaceRequest || destroyed) {
              surface.release(page);
              return;
            }
            activeSurfacePages.add(index);
          }
        }
        if (request !== surfaceRequest || destroyed) return;
        for (const index of ready.loadedPages) {
          if (!retained.includes(index) && activeSurfacePages.has(index)) {
            const page = pages.get(index);
            if (page) surface.release(page);
            activeSurfacePages.delete(index);
            pages.delete(index);
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
          activeSurfacePages.forEach((index) => {
            const page = pages.get(index);
            if (page) surface.release(page);
            pages.delete(index);
          });
          activeSurfacePages.clear();
        }
        pages.clear();
        document?.cleanup?.();
        document = undefined;
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
    const target = Math.max(0, Math.min(page, ready.pageCount - 1));
    if (target === ready.currentPage) return;
    if (pages.has(target)) {
      evictDistant(target);
      publishReady(target);
      if (dependencies.pageSurface) void prepareSurfaces(target);
      else warmAdjacent(target);
      return;
    }
    void loadPage(target).then(() => {
      evictDistant(target);
      publishReady(target);
      if (dependencies.pageSurface) void prepareSurfaces(target);
      else warmAdjacent(target);
    }).catch((error) => {
      publish({
        status: 'page-failure',
        metadata: input.metadata,
        mode: ready.mode,
        layout: ready.layout,
        pageCount: ready.pageCount,
        currentPage: ready.currentPage,
        pages: loadedPages(),
        page: target,
        message: errorMessage(error),
        fallback: input.fallback,
      });
    });
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
      activeSurfacePages.forEach((index) => {
        const page = pages.get(index);
        if (page) dependencies.pageSurface?.release(page);
      });
      activeSurfacePages.clear();
      document?.cleanup?.();
      document = undefined;
      pages.clear();
      try {
        validateProvider(input);
        document = await loader(input.publication);
        validate(document);
        await loadPage(0);
        publishReady(0);
        if (dependencies.pageSurface) await prepareSurfaces(0);
        else warmAdjacent(0);
      } catch (error) {
        if (document && pages.size === 0) {
          publish({
            status: 'page-failure',
            metadata: input.metadata,
            mode: input.configuration.mode,
            layout: input.configuration.layout ?? 'responsive',
            pageCount: document.pageCount,
            currentPage: 0,
            pages: loadedPages(),
            page: 0,
            message: errorMessage(error),
            fallback: input.fallback,
          });
        } else {
          publish({
            status: 'failure',
            metadata: input.metadata,
            message: errorMessage(error),
            fallback: input.fallback,
          });
        }
        document?.cleanup?.();
        document = undefined;
      }
      return state;
    },
    setMode,
    goTo,
    next: () => { void navigate(1); },
    previous: () => { void navigate(-1); },
    getVisiblePages: (wideViewport) => {
      const ready = readyState();
      if (!ready) return [];
      return visibleIndexes(ready.pageCount, ready.currentPage, ready.layout, wideViewport)
        .flatMap((index) => {
          const page = pages.get(index);
          return page ? [page] : [];
        });
    },
    useFallback: () => {
      publish({
        status: 'fallback',
        metadata: input.metadata,
        fallback: input.fallback,
        reason: state.status === 'failure' || state.status === 'page-failure' ? state.message : undefined,
      });
    },
    destroy: () => {
      surfaceRequest += 1;
      const ready = readyState();
      if (ready && dependencies.pageSurface) {
          activeSurfacePages.forEach((index) => {
            const page = pages.get(index);
            if (page) dependencies.pageSurface?.release(page);
          });
        activeSurfacePages.clear();
      }
      document?.cleanup?.();
      document = undefined;
      pages.clear();
      pending.clear();
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
    pageCount: publication.pages.length,
    loadPage: async (index) => {
      const page = publication.pages[index];
      if (!page) throw new Error(`Image page ${index + 1} is out of range.`);
      return { ...page, index };
    },
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
