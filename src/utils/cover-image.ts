export function isPlaceholderCover(coverImage: string | null): boolean {
  if (!coverImage?.trim()) return true;
  const normalized = coverImage.toLowerCase();
  return normalized.endsWith('/zines.png') || normalized.endsWith('/home-gif.gif');
}
