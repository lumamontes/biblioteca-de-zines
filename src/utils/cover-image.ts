export function isPlaceholderCover(coverImage: string | null): boolean {
  if (!coverImage?.trim()) return true;
  const normalized = coverImage.toLowerCase();
  return normalized.endsWith('/zines.png') || normalized.endsWith('/home-gif.gif');
}

export function isGeneratedCover(coverImage: string | null): boolean {
  return Boolean(coverImage && /\/zines\/\d+\/covers\/[^/]+\.webp$/.test(coverImage));
}
