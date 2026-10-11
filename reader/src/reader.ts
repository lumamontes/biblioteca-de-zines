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

export function createReader(input: ReaderInput, dependencies: ReaderDependencies): ReaderBoundary {
  let state = initialState(input);
  let destroyed = false;
  const listeners = new Set<(nextState: ReaderStatus) => void>();

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

  const goTo = (page: number) => {
    const ready = readyState();
    if (!ready) return;
    publish({ ...ready, currentPage: Math.max(0, Math.min(page, ready.pageCount - 1)) });
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
        });
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
    useFallback: () => {
      publish({
        status: 'fallback',
        metadata: input.metadata,
        fallback: input.fallback,
        reason: state.status === 'failure' ? state.message : undefined,
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
    pages: publication.pages.map((page, index) => ({ ...page, index })),
  });
}
