import type {
  PublicationRepresentation,
  ReaderBoundary,
  ReaderDependencies,
  ReaderDocument,
  ReaderInput,
  ReaderLayout,
  ReaderMode,
  ReaderPage,
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

export function createReader(input: ReaderInput, dependencies: ReaderDependencies): ReaderBoundary {
  let state = initialState(input);
  let destroyed = false;
  const listeners = new Set<(nextState: ReaderStatus) => void>();
  let document: ReaderDocument | undefined;
  const pages = new Map<number, ReaderPage>();
  const pending = new Map<number, Promise<ReaderPage>>();

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
        void loadPage(page).then(() => {
          if (state.status === 'ready') publishReady(state.currentPage);
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

  const navigate = async (delta: number) => {
    const ready = readyState();
    if (!ready) return;
    const target = Math.max(0, Math.min(ready.currentPage + delta, ready.pageCount - 1));
    if (target === ready.currentPage) return;
    try {
      await loadPage(target);
      publishReady(target);
      warmAdjacent(target);
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

  const goTo = (page: number) => {
    const ready = readyState();
    if (!ready) return;
    const target = Math.max(0, Math.min(page, ready.pageCount - 1));
    if (target === ready.currentPage) return;
    void loadPage(target).then(() => {
      publishReady(target);
      warmAdjacent(target);
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
      document = undefined;
      pages.clear();
      try {
        validateProvider(input);
        document = await loader(input.publication);
        validate(document);
        await loadPage(0);
        publishReady(0);
        warmAdjacent(0);
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
      }
      return state;
    },
    setMode,
    goTo,
    next: () => { void navigate(1); },
    previous: () => { void navigate(-1); },
    useFallback: () => {
      publish({
        status: 'fallback',
        metadata: input.metadata,
        fallback: input.fallback,
        reason: state.status === 'failure' || state.status === 'page-failure' ? state.message : undefined,
      });
    },
    destroy: () => {
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
    loadPage: async (index) => ({ ...publication.pages[index], index }),
  });
}
