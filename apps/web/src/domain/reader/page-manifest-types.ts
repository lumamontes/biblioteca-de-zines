export type { ReaderPageImage, ReaderPageManifest } from '@biblioteca-de-zines/reader';

/** A complete manifest already selected from the publication's active generation. */

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
