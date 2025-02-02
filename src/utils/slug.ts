import slugify from "slugify";

export function generateSlug(authorName: string, title: string): string {
  const firstAuthor = authorName.split(/[,;]/)[0]?.trim() || "autor";
  return slugify(`${firstAuthor}-${title}`, { lower: true, strict: true });
}
