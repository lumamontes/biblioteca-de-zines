const MAX_SLUG_LENGTH = 80;

export function slugify(title: string): string {
  const slug = title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length <= MAX_SLUG_LENGTH) return slug;
  return slug.slice(0, MAX_SLUG_LENGTH).replace(/-[^-]*$/, '') || slug.slice(0, MAX_SLUG_LENGTH);
}

export function proposalSegment(number: number, publicTitle: string): string {
  const slug = slugify(publicTitle);
  return slug ? `${number}-${slug}` : String(number);
}

export function proposalPath(number: number, publicTitle: string): string {
  return `/proposals/${proposalSegment(number, publicTitle)}`;
}

/** Resolves a route segment by its number only, so renamed titles keep shared links working. */
export function parseProposalSegment(segment: string): number | null {
  const match = /^(\d{1,9})(?:-|$)/.exec(segment);
  if (!match) return null;
  const number = Number(match[1]);
  return number > 0 ? number : null;
}
