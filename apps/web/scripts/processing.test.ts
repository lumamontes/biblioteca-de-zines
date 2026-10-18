import assert from 'node:assert/strict';
import test from 'node:test';
import { processClaimedZine } from '../src/application/processing/process-claimed-zine';
import type { ProcessingJob } from '../src/application/processing/processing-job-types';
import { createCoverProcessor } from '../src/infrastructure/cover-generation/cover-processor';
import { createPageProcessor } from '../src/infrastructure/page-generation/page-processor';

const job: ProcessingJob = {
  attemptCount: 1,
  id: 10,
  isPublished: true,
  pdfUrl: 'https://example.com/zine.pdf',
  title: 'Test zine',
  zineId: 42,
};

test('processing completes the job after the cover workflow succeeds', async () => {
  const events: string[] = [];
  const result = await processClaimedZine(job, {
    claimNext: async () => job,
    enqueue: async () => {},
    complete: async (jobId) => { events.push(`complete:${jobId}`); },
    fail: async () => {},
  }, async (receivedJob) => {
    assert.deepEqual(receivedJob, job);
    events.push('process');
  });

  assert.equal(result, 'completed');
  assert.deepEqual(events, ['process', 'complete:10']);
});

test('processing records a failure and does not complete the job', async () => {
  const events: string[] = [];
  const result = await processClaimedZine(job, {
    claimNext: async () => job,
    enqueue: async () => {},
    complete: async () => { events.push('complete'); },
    fail: async (jobId, _attemptCount, message) => { events.push(`fail:${jobId}:${message}`); },
  }, async () => {
    throw new Error('render failed');
  });

  assert.equal(result, 'failed');
  assert.deepEqual(events, ['fail:10:render failed']);
});

test('cover processor wires the processing job into the cover workflow', async () => {
  const events: string[] = [];
  const processor = createCoverProcessor({
    downloadSource: async (sourceUrl) => {
      events.push(`download:${sourceUrl}`);
      return { buffer: Buffer.from('%PDF source'), mimeType: 'application/pdf' };
    },
    repository: {
      getState: async (target) => {
        events.push(`state:${target.id}`);
        return { coverImage: null };
      },
      markFailed: async () => {},
      markProcessing: async (target) => { events.push(`processing:${target.id}`); },
      publish: async (generation) => {
        events.push(`publish:${generation.target.id}:${generation.sourceUrl}:${generation.replaceExternalCover}`);
        return true;
      },
    },
    storage: {
      storeCover: async (asset) => {
        events.push(`store:${asset.target.id}`);
        return 'https://assets.example/cover.webp';
      },
      discardGeneration: async () => {},
      removeCover: async () => {},
      isAvailable: async () => true,
    },
    renderFirstPage: async () => Buffer.from('rendered'),
    optimizeCover: async (image) => {
      events.push(`optimize:${image.toString()}`);
      return image;
    },
  }, { replaceExternalCover: true });

  await processor(job);

  assert.deepEqual(events, [
    'state:42',
    'processing:42',
    'download:https://example.com/zine.pdf',
    'optimize:rendered',
    'store:42',
    'publish:42:https://example.com/zine.pdf:true',
  ]);
});

test('cover processor continues when source observation recording fails', async () => {
  const events: string[] = [];
  const processor = createCoverProcessor({
    downloadSource: async () => { events.push('download'); return { buffer: Buffer.from('%PDF source'), mimeType: 'application/pdf' }; },
    recordSourceObservation: async () => { events.push('observe'); throw new Error('metadata store unavailable'); },
    repository: {
      getState: async () => ({ coverImage: null }),
      markFailed: async () => {},
      markProcessing: async () => { events.push('processing'); },
      publish: async () => { events.push('publish'); return true; },
    },
    storage: {
      storeCover: async () => { events.push('store'); return 'https://assets.example/cover.webp'; },
      discardGeneration: async () => {},
      removeCover: async () => {},
      isAvailable: async () => true,
    },
    renderFirstPage: async () => Buffer.from('rendered'),
    optimizeCover: async () => Buffer.from('optimized'),
  });

  await processor(job);
  assert.deepEqual(events, ['processing', 'download', 'observe', 'store', 'publish']);
});

test('page processing records observations before derivatives and ignores optional recorder failures', async () => {
  const events: string[] = [];
  const processor = createPageProcessor({
    downloadSource: async () => { events.push('download'); return { buffer: Buffer.from('%PDF'), mimeType: 'application/pdf' }; },
    recordSourceObservation: async () => { events.push('observe'); throw new Error('metadata store unavailable'); },
    renderPages: async (_source, onPage) => {
      await onPage({ pageNumber: 1, width: 1, height: 1, contentType: 'image/webp', data: Buffer.from('page') });
      return 1;
    },
    repository: { isProcessable: async () => true, markProcessing: async () => {}, markFailed: async () => {}, activate: async () => ({ activated: true }) },
    storage: { uploadPage: async () => 'page', isPageAvailable: async () => true, deleteGeneration: async () => {}, uploadCover: async () => 'cover', deleteCover: async () => {} },
  });

  await processor(job);
  assert.deepEqual(events, ['download', 'observe']);
});
