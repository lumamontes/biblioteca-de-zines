import { createImageReaderRenderer } from '@/infrastructure/reader/image-reader-adapter';

export function createPublicReaderRenderer() {
  return createImageReaderRenderer();
}
