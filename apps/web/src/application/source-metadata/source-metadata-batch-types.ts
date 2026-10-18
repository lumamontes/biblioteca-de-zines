import type { SourceMetadataObservation } from './source-metadata-types';

export type SourceMetadataBatchSource = {
  sourceId: string;
  publicationId: number | null;
  submissionId: number | null;
  sourceUri: string;
  catalogue?: { title: string | null; author: string | null };
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

export type SourceMetadataBatchRun = {
  results: SourceMetadataBatchResult[];
  report: import('./source-metadata-report-types').SourceMetadataReport;
};
