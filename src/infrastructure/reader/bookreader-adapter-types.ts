export type BookReaderPage = {
  width: number;
  height: number;
  uri: string;
  pageNum: number;
};

export type BookReaderOptions = {
  el: string;
  data: BookReaderPage[][];
  ui: 'responsive';
  showToolbar: boolean;
  imagesBaseURL: string;
};

export type BookReaderEvent = (event: unknown, props: unknown) => void;

export type BookReaderInstance = {
  options: BookReaderOptions;
  bind: (name: string, callback: BookReaderEvent) => void;
  unbind: (name: string, callback?: BookReaderEvent) => void;
  init: () => void;
  next: () => void;
  prev: () => void;
  jumpToPage: (pageNumber: number) => void;
  currentIndex?: () => number;
  resize?: () => void;
  destroy?: () => void;
};

export type BookReaderFactory = (options: BookReaderOptions) => BookReaderInstance;
