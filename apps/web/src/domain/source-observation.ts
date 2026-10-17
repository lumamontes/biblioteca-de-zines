import { createHash } from 'node:crypto';
import { detectFileTypeFromBuffer } from '@/utils/file-type-detection';
import type {
  FixityObservation,
  PdfSourceInspector,
  SourceObservation,
  SourceObservationInput,
  SourceObservationOutcome,
  PriorFixity,
} from './source-observation-types';
import {
  SOURCE_OBSERVATION_EXTRACTOR_VERSION,
  SOURCE_OBSERVATION_VERSION,
} from './source-observation-types';

const now = () => new Date();

export async function extractSourceObservation(
  input: SourceObservationInput,
  inspectPdf: PdfSourceInspector,
  clock: () => Date = now,
  priorFixity?: PriorFixity | null,
): Promise<SourceObservationOutcome> {
  const observedAt = clock();
  if (!input.source || input.acquisition?.status === 'unreachable') {
    return failed('unreachable', input.acquisition?.failureReason ?? 'The source could not be acquired', observedAt, null, null, 'not_attempted', null);
  }

  const { buffer, mimeType } = input.source;
  const fixity = createFixity(buffer, observedAt, priorFixity);
  const detected = detectFileTypeFromBuffer(buffer).mimeType;
  if (detected !== 'application/pdf') {
    return failed('not_pdf', `The source was identified as ${detected}`, observedAt, fixity, detected, 'identified', detected);
  }

  try {
    const inspection = await inspectPdf(buffer);
    const pages = inspection.pages.map((page, index) => ({
      pageNumber: index + 1,
      width: page.width,
      height: page.height,
      orientation: orientation(page.width, page.height),
    }));
    const textPages = inspection.pages.filter((page) => page.text.status !== 'unknown');
    const pagesWithText = textPages.filter((page) => page.text.status === 'present').length;
    const pagesWithoutText = textPages.filter((page) => page.text.status === 'absent').length;
    const extractedPages = inspection.pages.filter((page) => page.text.extracted).length;
    const failedPages = inspection.pages.filter((page) => !page.text.extracted && page.text.status !== 'unknown').length;
    const unknownPages = inspection.pages.filter((page) => page.text.status === 'unknown').length;

    const observation: SourceObservation = {
      observationVersion: SOURCE_OBSERVATION_VERSION,
      extractorVersion: SOURCE_OBSERVATION_EXTRACTOR_VERSION,
      observedAt: observedAt.toISOString(),
      sourceUri: input.sourceUri ?? null,
      acquisition: input.acquisition,
      receivedByteSize: buffer.byteLength,
      mediaTypeDeclared: input.source.acquisition ? input.source.acquisition.declaredMediaType : mimeType,
      mediaTypeDetected: input.source.acquisition?.detectedMediaType ?? detected,
      formatIdentification: 'identified',
      formatIdentifier: 'application/pdf',
      fixity,
      pdf: {
        pageCount: pages.length,
        pages,
        embeddedMetadata: { ...inspection.metadata, tool: inspection.tool, extractedAt: observedAt.toISOString() },
        textLayer: {
          status: textPages.length === 0 ? 'unknown' : pagesWithText > 0 ? 'present' : 'absent',
          pagesWithText,
          pagesWithoutText,
          pagesNotChecked: inspection.pages.length - textPages.length,
        },
        textExtraction: {
          status: inspection.pages.length === 0 ? 'not_attempted' : failedPages > 0 ? extractedPages > 0 ? 'partial' : 'failed' : unknownPages > 0 ? extractedPages > 0 ? 'partial' : 'not_attempted' : 'complete',
          extractedPages,
          failedPages,
          unknownPages,
        },
      },
      provenance: {
        note: 'Observed from acquired source bytes; values are not catalogue metadata.',
        valueProvenance: {
          sourceUri: 'source-supplied', acquisition: 'source-supplied', mediaTypeDeclared: 'source-supplied',
          mediaTypeDetected: 'system-observed', formatIdentification: 'system-observed', pdf: 'tool-produced', fixity: 'system-observed',
        },
        uncertaintyStatus: failedPages > 0 || unknownPages > 0 ? 'partial' : 'complete',
        visibility: 'internal',
      },
    };
    return { version: SOURCE_OBSERVATION_VERSION, status: 'observed', observation };
  } catch (error) {
    const reason = error instanceof Error && error.name === 'PasswordException'
      ? 'protected'
      : error instanceof Error && error.name === 'InvalidPDFException'
        ? 'invalid_pdf'
        : 'extraction_failed';
    return failed(reason, error instanceof Error ? error.message : 'PDF inspection failed', observedAt, fixity, detected, 'identified', 'application/pdf');
  }
}

function orientation(width: number, height: number): 'portrait' | 'landscape' | 'square' {
  return width === height ? 'square' : width > height ? 'landscape' : 'portrait';
}

function createFixity(buffer: Buffer, calculatedAt: Date, prior: PriorFixity | null | undefined): FixityObservation {
  const digest = createHash('sha256').update(buffer).digest('hex');
  return {
    algorithm: 'SHA-256',
    digest,
    context: 'acquisition',
    calculatedAt: calculatedAt.toISOString(),
    checkStatus: prior?.algorithm.toLowerCase() === 'sha-256' ? prior.digest === digest ? 'matched' : 'mismatch' : 'not_compared',
    comparisonDetail: prior ? `Compared with ${prior.context} digest ${prior.digest}: ${prior.digest === digest ? 'matched' : 'mismatch'}` : null,
  };
}

function failed(
  reason: 'unreachable' | 'not_pdf' | 'invalid_pdf' | 'protected' | 'extraction_failed',
  message: string,
  observedAt: Date,
  fixity: FixityObservation | null,
  detectedMediaType: string | null,
  formatIdentification: 'identified' | 'unidentified' | 'not_attempted',
  formatIdentifier: string | null,
): SourceObservationOutcome {
  return { version: SOURCE_OBSERVATION_VERSION, status: 'failed', observedAt: observedAt.toISOString(), extractorVersion: SOURCE_OBSERVATION_EXTRACTOR_VERSION, reason, message, fixity, detectedMediaType, formatIdentification, formatIdentifier };
}
