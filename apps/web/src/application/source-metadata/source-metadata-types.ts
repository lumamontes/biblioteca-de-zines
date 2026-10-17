export type SourceAssetKind = 'source' | 'reading-copy' | 'preview' | 'derivative';

export type SourceObservationStatus =
  | 'observed'
  | 'unreachable'
  | 'not_pdf'
  | 'invalid_pdf'
  | 'protected'
  | 'extraction_failed';

export type FixityContext = 'acquisition' | 'validation' | 'storage-check' | 'delivery';

export interface PdfPageGeometry {
  pageNumber: number;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape' | 'square';
}

export interface PdfEmbeddedMetadata {
  title: string | null;
  author: string | null;
  subject: string | null;
  creator: string | null;
  producer: string | null;
  creationDate: string | null;
  modificationDate: string | null;
}

export interface SourceFixityObservation {
  algorithm: 'sha-256' | (string & {});
  digest: string;
  context: FixityContext;
  calculatedAt: string;
  checkStatus: 'not_compared' | 'matched' | 'mismatch';
  comparisonDetail: string | null;
}

export interface SourceMetadataObservation {
  observationId: string;
  publicationId: number | null;
  submissionId: number | null;
  assetKind: SourceAssetKind;
  observedAt: string;
  extractorVersion: string;
  sourceUri: string | null;
  acquisitionMethod: string;
  acquiredAt: string;
  status: SourceObservationStatus;
  failureReason: string | null;
  sourceFilename: string | null;
  sourceSize: number | null;
  httpStatus: number | null;
  redirectOutcome: string | null;
  receivedByteSize: number | null;
  declaredMediaType: string | null;
  detectedMediaType: string | null;
  formatIdentificationStatus: 'identified' | 'unidentified' | 'not_attempted';
  formatIdentifier: string | null;
  storageReference: string | null;
  pageCount: number | null;
  pages: PdfPageGeometry[];
  textLayerStatus: 'present' | 'absent' | 'partial' | 'unknown' | 'not_applicable';
  textExtractionStatus: 'succeeded' | 'partial' | 'failed' | 'not_attempted' | 'not_applicable';
  embeddedMetadata: PdfEmbeddedMetadata | null;
  fixity: SourceFixityObservation | null;
  provenanceNote: string | null;
  valueProvenance: Record<string, unknown>;
  uncertaintyStatus: 'complete' | 'partial' | 'failed' | 'unknown';
  visibility: 'internal';
}

export interface SourceMetadataExtractorInput {
  bytes: Uint8Array;
  sourceUri?: string | null;
  declaredMediaType?: string | null;
  sourceFilename?: string | null;
}

export type SourceMetadataExtractor = (
  input: SourceMetadataExtractorInput,
) => Promise<SourceMetadataObservation>;

export interface SourceMetadataRepository {
  create(observation: SourceMetadataObservation): Promise<number>;
  findLatestFixity(sourceUri: string): Promise<{ algorithm: string; digest: string; context: string } | null>;
}
