export type ReaderPageImage = {
  generationId: string;
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
};

/** A complete manifest already selected from the publication's active generation. */
export type ReaderPageManifest = {
  generationId: string;
  pageCount: number;
  pages: readonly ReaderPageImage[];
};

export type PageManifestIssue =
  | 'empty'
  | 'invalid-generation'
  | 'invalid-page-count'
  | 'incomplete-generation'
  | 'invalid-page-number'
  | 'duplicate-page-number'
  | 'page-sequence'
  | 'mixed-generation'
  | 'invalid-url'
  | 'invalid-dimensions';
