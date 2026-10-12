export type ReaderPageImage = {
  generationId: string;
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
};

export type ReaderPageManifest = {
  generationId: string;
  pages: readonly ReaderPageImage[];
};

export type PageManifestIssue =
  | 'empty'
  | 'invalid-generation'
  | 'invalid-page-number'
  | 'duplicate-page-number'
  | 'page-sequence'
  | 'mixed-generation'
  | 'invalid-url'
  | 'invalid-dimensions';

export class InvalidPageManifestError extends Error {
  readonly issues: readonly PageManifestIssue[];

  constructor(issues: readonly PageManifestIssue[]) {
    super(`Invalid reader page manifest: ${issues.join(', ')}`);
    this.name = 'InvalidPageManifestError';
    this.issues = issues;
  }
}

export function createPageManifest(input: ReaderPageManifest): ReaderPageManifest {
  const issues = new Set<PageManifestIssue>();
  if (!input.generationId.trim()) issues.add('invalid-generation');
  if (input.pages.length === 0) issues.add('empty');

  const pageNumbers = new Set<number>();
  input.pages.forEach((page, index) => {
    if (!Number.isInteger(page.pageNumber) || page.pageNumber < 1) issues.add('invalid-page-number');
    if (pageNumbers.has(page.pageNumber)) issues.add('duplicate-page-number');
    pageNumbers.add(page.pageNumber);
    if (page.pageNumber !== index + 1) issues.add('page-sequence');
    if (page.generationId !== input.generationId) issues.add('mixed-generation');
    if (!page.imageUrl.trim()) issues.add('invalid-url');
    if (!Number.isFinite(page.width) || page.width <= 0 || !Number.isFinite(page.height) || page.height <= 0) {
      issues.add('invalid-dimensions');
    }
  });

  if (issues.size > 0) throw new InvalidPageManifestError([...issues]);
  return input;
}
