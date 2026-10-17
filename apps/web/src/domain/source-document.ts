export type SourceDocument = {
  buffer: Buffer;
  mimeType: string;
  acquisition?: {
    acquiredAt: string | null;
    filename: string | null;
    declaredSize: number | null;
    receivedByteSize: number | null;
    httpStatus: number | null;
    redirectOutcome: string | null;
    declaredMediaType: string | null;
    detectedMediaType: string;
  };
};

export class SourceAcquisitionError extends Error {
  constructor(message: string, readonly acquisition: NonNullable<SourceDocument['acquisition']>) {
    super(message);
    this.name = 'SourceAcquisitionError';
  }
}
