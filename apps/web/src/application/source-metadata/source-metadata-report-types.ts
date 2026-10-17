import type { SourceMetadataObservation } from './source-metadata-types';

export type SourceMetadataReportInput = {
  observation: SourceMetadataObservation;
  catalogue?: {
    title?: string | null;
    author?: string | null;
  };
};

export type SourceMetadataReport = {
  duplicateChecksums: Array<{ digest: string; observationIds: string[] }>;
  failedSources: Array<{ observationId: string; status: SourceMetadataObservation['status']; reason: string | null }>;
  missingTextLayers: string[];
  metadataConflicts: Array<{
    observationId: string;
    field: 'title' | 'author';
    catalogueValue: string;
    observedValue: string;
  }>;
};
