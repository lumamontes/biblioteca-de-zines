import type { ProcessingRequester } from '@/application/processing/processing-request-types';
import { enqueueZineProcessing } from '@/infrastructure/processing/enqueue-zine-processing';
import { dispatchZineProcessing } from '@/infrastructure/processing/zine-processing-dispatch-service';

export function createZineProcessingRequester(): ProcessingRequester {
  return {
    async request(zineId) {
      await enqueueZineProcessing(zineId);
      try {
        await dispatchZineProcessing();
      } catch (error) {
        console.error('Erro ao disparar processamento da zine:', error);
      }
    },
  };
}
