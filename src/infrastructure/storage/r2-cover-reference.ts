export function coverObjectKey(
  publicUrl: string | undefined,
  target: { id: number; kind: 'zine' },
  coverUrl: string,
): string | null {
  const normalizedPublicUrl = publicUrl?.replace(/\/$/, '');
  if (!normalizedPublicUrl) return null;

  const prefix = `${normalizedPublicUrl}/zines/${target.id}/covers/`;
  if (!coverUrl.startsWith(prefix)) return null;

  const key = coverUrl.slice(`${normalizedPublicUrl}/`.length);
  return /^zines\/\d+\/covers\/[^/]+\.webp$/.test(key) ? key : null;
}
