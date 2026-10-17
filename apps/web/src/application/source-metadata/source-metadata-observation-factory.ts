import type { SourceMetadataBatchSource } from './source-metadata-batch-types';
import type { SourceMetadataObservation } from './source-metadata-types';
import { mapSourceObservation, type SourceMetadataAcquisition } from './source-metadata-observation-mapper';
import type { SourceObservationOutcome } from '@/domain/source-observation-types';

export function createSourceMetadataObservation(
  source: SourceMetadataBatchSource,
  outcome: SourceObservationOutcome,
  acquisition: SourceMetadataAcquisition,
): SourceMetadataObservation {
  return mapSourceObservation(source, outcome, acquisition, 'Observed from an existing source during batch inventory; values are not catalogue metadata.');
}
