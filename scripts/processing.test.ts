import assert from 'node:assert/strict';
import test from 'node:test';
import { processClaimedZine } from '../src/application/processing/process-claimed-zine';
import type { ProcessingJob } from '../src/application/processing/processing-job-types';

const job: ProcessingJob = {
  attemptCount: 1,
  id: 10,
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
  }, async () => {
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
    fail: async (jobId, message) => { events.push(`fail:${jobId}:${message}`); },
  }, async () => {
    throw new Error('render failed');
  });

  assert.equal(result, 'failed');
  assert.deepEqual(events, ['fail:10:render failed']);
});
