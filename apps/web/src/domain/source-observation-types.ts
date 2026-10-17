import type { SourceDocument } from './source-document';

export const SOURCE_OBSERVATION_VERSION = 1 as const;
export const SOURCE_OBSERVATION_EXTRACTOR_VERSION = 'pdf-source-observation/v1' as const;

export type SourceObservationFailureReason =
  | 'unreachable'
  | 'not_pdf'
  | 'invalid_pdf'
  | 'protected'
  | 'extraction_failed';

export type SourceObservationInput = {
  source?: SourceDocument;
  sourceUri?: string;
  observedAt?: Date;
  acquisition?: {
    method?: 'http' | 'google-drive' | 'direct-file' | 'unknown';
    status?: 'acquired' | 'unreachable';
    failureReason?: string;
    filename?: string;
    declaredSize?: number;
    httpStatus?: number;
    redirectCount?: number;
  };
};

export type PdfEmbeddedMetadata = {
  title: string | null;
  author: string | null;
  subject: string | null;
  creator: string | null;
  producer: string | null;
  creationDate: string | null;
  modificationDate: string | null;
  tool: string;
  extractedAt: string;
};

export type PdfPageObservation = {
  pageNumber: number;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape' | 'square';
};

export type TextLayerObservation = {
  status: 'present' | 'absent' | 'unknown';
  pagesWithText: number;
  pagesWithoutText: number;
  pagesNotChecked: number;
};

export type TextExtractionObservation = {
  status: 'complete' | 'partial' | 'failed' | 'not_attempted';
  extractedPages: number;
  failedPages: number;
  unknownPages: number;
};

export type FixityObservation = {
  algorithm: 'SHA-256';
  digest: string;
  context: 'acquisition' | 'validation' | 'storage-check' | 'delivery';
  calculatedAt: string;
  checkStatus: 'not_compared' | 'matched' | 'mismatch';
  comparisonDetail: string | null;
};

export type SourceObservation = {
  observationVersion: typeof SOURCE_OBSERVATION_VERSION;
  extractorVersion: typeof SOURCE_OBSERVATION_EXTRACTOR_VERSION;
  observedAt: string;
  sourceUri: string | null;
  acquisition: SourceObservationInput['acquisition'];
  receivedByteSize: number;
  mediaTypeDeclared: string;
  mediaTypeDetected: string;
  formatIdentification: 'identified' | 'unidentified';
  formatIdentifier: 'application/pdf' | null;
  fixity: FixityObservation;
  pdf: {
    pageCount: number;
    pages: PdfPageObservation[];
    embeddedMetadata: PdfEmbeddedMetadata;
    textLayer: TextLayerObservation;
    textExtraction: TextExtractionObservation;
  };
  provenance: {
    note: string;
    valueProvenance: Record<string, 'source-supplied' | 'system-observed' | 'tool-produced'>;
    uncertaintyStatus: 'complete' | 'partial' | 'failed' | 'unknown';
    visibility: 'internal';
  };
};

export type SourceObservationOutcome =
  | {
      version: typeof SOURCE_OBSERVATION_VERSION;
      status: 'observed';
      observation: SourceObservation;
    }
  | {
      version: typeof SOURCE_OBSERVATION_VERSION;
      status: 'failed';
      observedAt: string;
      extractorVersion: typeof SOURCE_OBSERVATION_EXTRACTOR_VERSION;
      reason: SourceObservationFailureReason;
      message: string;
      fixity: FixityObservation | null;
      detectedMediaType: string | null;
      formatIdentification: 'identified' | 'unidentified' | 'not_attempted';
      formatIdentifier: string | null;
    };

export type PdfInspection = {
  tool: string;
  metadata: Omit<PdfEmbeddedMetadata, 'tool' | 'extractedAt'>;
  pages: Array<{
    width: number;
    height: number;
    text: { status: 'present' | 'absent' | 'unknown'; extracted: boolean };
  }>;
};

export type PdfSourceInspector = (buffer: Buffer) => Promise<PdfInspection>;

export type PriorFixity = { algorithm: string; digest: string; context: string };
