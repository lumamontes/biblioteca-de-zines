import type { PageManifestIssue, ReaderPageManifest } from './page-manifest-types';
export type { PageManifestIssue, ReaderPageImage, ReaderPageManifest } from './page-manifest-types';

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
  if (!Number.isInteger(input.pageCount) || input.pageCount < 1) issues.add('invalid-page-count');
  if (input.pages.length === 0) issues.add('empty');
  if (input.pages.length !== input.pageCount) issues.add('incomplete-generation');

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
