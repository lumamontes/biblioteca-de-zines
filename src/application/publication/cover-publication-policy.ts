import { isGeneratedCover, isPlaceholderCover } from '@/utils/cover-image';

export function resolvePublishedCover(input: {
  submittedCoverImage?: string;
  currentCoverImage: string | null;
  currentZineId: number;
  coverWasRemoved: boolean;
}): string | null {
  if (input.submittedCoverImage) return input.submittedCoverImage;
  if (!input.currentCoverImage) return null;
  if (isGeneratedCover(input.currentCoverImage, input.currentZineId)) {
    return input.currentCoverImage;
  }
  if (!input.coverWasRemoved && !isPlaceholderCover(input.currentCoverImage)) {
    return input.currentCoverImage;
  }
  return null;
}

export function needsGeneratedCover(input: {
  pdfUrl: string | null;
  coverImage: string | null;
  zineId: number;
  hasCompleteGeneratedCover: boolean;
}): boolean {
  if (!input.pdfUrl || input.hasCompleteGeneratedCover) return false;
  return !input.coverImage
    || isPlaceholderCover(input.coverImage)
    || isGeneratedCover(input.coverImage, input.zineId);
}
