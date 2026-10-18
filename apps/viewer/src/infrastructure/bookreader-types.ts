export type BookReaderInstance = {
  init: () => void;
  bind: (event: string, callback: (...args: unknown[]) => void) => void;
  unbind?: (event: string) => void;
  next: () => void;
  prev: () => void;
  jumpToPage: (page: number) => void;
  resize?: () => void;
  destroy?: () => void;
};

export type BookReaderFactory = new (options: unknown) => BookReaderInstance;

declare global {
  interface Window { BookReader?: BookReaderFactory; }
}
