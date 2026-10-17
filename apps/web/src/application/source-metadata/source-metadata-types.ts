export type SourceMetadataAssetKind = 'source' | 'reading-copy' | 'preview' | 'derivative';

export type SourceMetadataStatus =
  | 'acquired'
  | 'unreachable'
  | 'not_pdf'
  | 'invalid_pdf'
  | 'protected'
  | 'extraction_failed';

export type SourceMetadataObservation = {
  libraryZineId?: number | null;
  formUploadId?: number | null;
  sourceReference?: string | null;
  assetKind: SourceMetadataAssetKind;
  observedAt?: string;
  extractorVersion: string;
  sourceUri?: string | null;
  acquisitionMethod?: string | null;
  acquiredAt?: string | null;
  status: SourceMetadataStatus;
  failureReason?: string | null;
  sourceFilename?: string | null;
  sourceSizeBytes?: number | null;
  httpStatus?: number | null;
  redirectOutcome?: string | null;
  receivedByteSize?: number | null;
  declaredMediaType?: string | null;
  detectedMediaType?: string | null;
  formatIdentificationStatus?: string | null;
  formatIdentifier?: string | null;
  storageKey?: string | null;
  pdfPageCount?: number | null;
  pageObservations?: Record<string, unknown> | unknown[] | null;
  textLayerStatus?: string | null;
  extractionStatus?: string | null;
  embeddedMetadata?: Record<string, unknown> | null;
  fixityAlgorithm?: string | null;
  fixityDigest?: string | null;
  fixityContext?: string | null;
  fixityCalculatedAt?: string | null;
  fixityCheckStatus?: string | null;
  fixityComparisonDetail?: string | null;
  provenanceNote?: string | null;
  valueProvenance?: Record<string, unknown> | null;
  uncertaintyStatus?: string | null;
  visibilityState?: 'private' | 'internal';
};

export interface SourceMetadataRepository {
  create(observation: SourceMetadataObservation): Promise<number>;
}
