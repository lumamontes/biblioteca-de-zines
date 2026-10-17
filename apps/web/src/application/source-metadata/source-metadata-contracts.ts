export type SourceMetadataAcquisition = {
  method: string;
  acquiredAt: string | null;
  filename: string | null;
  declaredSize: number | null;
  receivedByteSize: number | null;
  httpStatus: number | null;
  redirectOutcome: string | null;
  declaredMediaType: string | null;
  detectedMediaType: string | null;
};

export type SourceMetadataDerivative = {
  sourceObservationId: number;
  observationId: string;
  assetIdentity: string;
  assetKind: 'reading-copy' | 'preview' | 'derivative';
  storageReference: string;
  mediaType: string;
  byteSize: number | null;
  observedAt: string;
  provenanceNote: string;
};
