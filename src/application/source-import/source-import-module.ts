import type {
  ZineProcessingRequester,
  ZineSourceRepository,
} from '@/application/source-import/zine-source-import-types';

export function createZineSourceImportModule(deps: {
  zines: ZineSourceRepository;
  processing: ZineProcessingRequester;
}) {
  return {
    async importFromDrive(zineId: number, driveUrl: string): Promise<void> {
      await deps.zines.updatePdfUrl(zineId, driveUrl);
      await deps.processing.request(zineId);
    },
  };
}
