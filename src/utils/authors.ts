import { Author } from "@/schemas/apply-zine";

// A marker that never appears in names submitted before this fix (the old
// pipeline only ever joined authors with ", "/"; "/" e "), so its presence
// in author_name reliably identifies rows saved by flattenAuthors() below.
const AUTHOR_SEPARATOR = " || ";
const LINK_SEPARATOR = ", ";

type UploadAuthorFields = {
  author_name: string | null;
  author_url: string | null;
};

/**
 * Packs each author's name and their own links into the two existing flat
 * text columns, keeping one author_url "slot" per author (even an empty one)
 * so the two lists stay positionally aligned and parseUploadAuthors() can
 * zip them back together without guessing which link belongs to whom.
 */
export function flattenAuthors(
  authors: Author[],
): { author_name: string; author_url: string | null } {
  const names = authors.map((author) => author.name.trim());
  const linkGroups = authors.map((author) =>
    (author.socialLinks || [])
      .map((link) => link.trim())
      .filter(Boolean)
      .join(LINK_SEPARATOR),
  );

  return {
    author_name: names.join(AUTHOR_SEPARATOR),
    author_url: linkGroups.some(Boolean) ? linkGroups.join(AUTHOR_SEPARATOR) : null,
  };
}

/**
 * Reverses flattenAuthors(). Rows saved before this fix used a plain comma
 * to join every author's name AND every author's links into the same two
 * blobs, with no way to tell which link belonged to which author — that's
 * the bug being fixed. For those legacy multi-author rows there's no way to
 * recover who a link belonged to, so social links come back empty (ready for
 * a reviewer to fill in correctly) instead of guessing; the original blob is
 * still available via getLegacyAuthorLinksNotice() for read-only display.
 */
export function parseUploadAuthors(upload: UploadAuthorFields): Author[] {
  const authorName = (upload.author_name || "").trim();
  if (!authorName) return [];

  if (authorName.includes(AUTHOR_SEPARATOR)) {
    const names = authorName
      .split(AUTHOR_SEPARATOR)
      .map((name) => name.trim())
      .filter(Boolean);
    const linkGroups = (upload.author_url || "").split(AUTHOR_SEPARATOR);
    return names.map((name, index) => ({
      name,
      socialLinks: splitLinks(linkGroups[index]),
    }));
  }

  const legacyNames = splitLegacyNames(authorName);

  if (legacyNames.length <= 1) {
    // No author-boundary ambiguity: the whole author_url is this one
    // author's, so recover their individual links normally.
    return [{ name: authorName, socialLinks: splitLinks(upload.author_url) }];
  }

  return legacyNames.map((name) => ({ name, socialLinks: [] }));
}

/**
 * For legacy multi-author rows (saved before the ` || ` marker existed),
 * author_url is one unsplittable blob of links with no way to tell which
 * author they belong to. Returns that raw blob so the UI can show it as
 * read-only context for manual review, or null when there's nothing to show.
 */
export function getLegacyAuthorLinksNotice(upload: UploadAuthorFields): string | null {
  const authorName = (upload.author_name || "").trim();
  if (!authorName || authorName.includes(AUTHOR_SEPARATOR)) return null;
  if (splitLegacyNames(authorName).length <= 1) return null;

  return upload.author_url || null;
}

function splitLegacyNames(authorName: string): string[] {
  return authorName
    .split(/[,;]| e /)
    .map((name) => name.trim())
    .filter(Boolean);
}

function splitLinks(group: string | null | undefined): string[] {
  return (group || "")
    .split(LINK_SEPARATOR)
    .map((link) => link.trim())
    .filter(Boolean);
}
