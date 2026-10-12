import assert from 'node:assert/strict';
import test from 'node:test';
import { createSubmissionService } from '../src/application/submission/submission-service';
import type {
  SubmissionInput,
  SubmissionReceipt,
} from '../src/application/submission/submission-types';

const input: SubmissionInput = {
  authors: [{ name: 'Author', socialLinks: [] }],
  zines: [{ title: 'Test zine', pdfUrl: 'https://example.com/zine.pdf', year: '2026' }],
  contactEmail: 'author@example.com',
};

test('submission service persists first and notifies with the receipt', async () => {
  const events: string[] = [];
  const receipt: SubmissionReceipt = {
    submissionBatchId: 'batch-1',
    authorNames: ['Author'],
    zineCount: 1,
    zineTitles: ['Test zine'],
  };
  const service = createSubmissionService({
    submissions: {
      async create(_, batchId) {
        events.push(`persist:${batchId}`);
        return receipt;
      },
    },
    notifications: {
      async notify(notification) {
        events.push(`notify:${notification.submissionBatchId}`);
      },
    },
  });

  const result = await service.submit(input);

  assert.deepEqual(result, receipt);
  assert.match(events[0], /^persist:\d+$/);
  assert.equal(events[1], 'notify:batch-1');
});

test('submission service does not notify when persistence fails', async () => {
  let notified = false;
  const service = createSubmissionService({
    submissions: {
      async create() {
        throw new Error('database unavailable');
      },
    },
    notifications: {
      async notify() {
        notified = true;
      },
    },
  });

  await assert.rejects(() => service.submit(input), /database unavailable/);
  assert.equal(notified, false);
});
