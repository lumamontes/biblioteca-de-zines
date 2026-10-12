export function isPlaceholderCover(coverImage: string | null): boolean {
  if (!coverImage?.trim()) return true;
  const normalized = coverImage.toLowerCase();
  return normalized.endsWith('/zines.png') || normalized.endsWith('/home-gif.gif');
}

export function isInvalidCoverReference(coverImage: string | null): boolean {
  return Boolean(coverImage?.startsWith('file://'));
}

export function isGeneratedCover(coverImage: string | null, zineId: number): boolean {
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, '');
  return Boolean(
    publicUrl
    && coverImage?.startsWith(`${publicUrl}/`)
    && new RegExp(`^${escapeRegExp(publicUrl)}/zines/${zineId}/covers/[^/]+\\.webp$`).test(coverImage),
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
