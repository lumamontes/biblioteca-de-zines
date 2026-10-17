import type { SourceMetadataObservation } from './source-metadata-types';

export type SourceMetadataBatchSource = {
  sourceId: string;
  publicationId: number | null;
  submissionId: number | null;
  sourceUri: string;
};

export type SourceMetadataBatchResult = {
  sourceId: string;
  observationId: number;
  status: SourceMetadataObservation['status'];
};

export type SourceMetadataBatchDependencies = {
  listSources: () => Promise<SourceMetadataBatchSource[]>;
  observe: (source: SourceMetadataBatchSource) => Promise<SourceMetadataObservation>;
  record: (observation: SourceMetadataObservation) => Promise<number>;
};
