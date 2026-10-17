import { isGeneratedCover, isPlaceholderCover } from '@/utils/cover-image';
import type { CoverMigrationZine } from '@/application/cover-generation/cover-migration-types';

export async function selectCoverMigrationCandidates(
  zines: CoverMigrationZine[],
  excludedIds: ReadonlySet<number>,
  isReachableImage: (url: string | null) => Promise<boolean>,
): Promise<CoverMigrationZine[]> {
  const candidates: CoverMigrationZine[] = [];
  for (const zine of zines) {
    if (excludedIds.has(zine.id) || !zine.pdf_url) continue;

    const generatedCoverIsCurrent = isGeneratedCover(zine.cover_image, zine.id)
      && zine.processed_pdf_url === zine.pdf_url
      && zine.import_status === 'completed';
    const coverIsReachable = zine.cover_image ? await isReachableImage(zine.cover_image) : false;
    if (generatedCoverIsCurrent && coverIsReachable) continue;
    if (coverIsReachable && !isPlaceholderCover(zine.cover_image)
      && !isGeneratedCover(zine.cover_image, zine.id)) continue;

    candidates.push(zine);
  }
  return candidates;
}
