declare global {
  interface Window {
    BookReader: new (options: import('../infrastructure/reader/bookreader-adapter-types').BookReaderOptions) => import('../infrastructure/reader/bookreader-adapter-types').BookReaderInstance;
  }
}

export {};
