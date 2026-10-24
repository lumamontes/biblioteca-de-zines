import assert from 'node:assert/strict';
import test from 'node:test';
import { createKnownFailuresReport } from './export-known-failures.mjs';

test('overwrites known failures with every non-available monitor result', () => {
  const result = createKnownFailuresReport(
    [
      { id: 'library_zines:1', title: 'Drive file', url: 'https://drive.google.com/file/d/file-id/view' },
      { id: 'library_zines:2', title: 'Drive folder', url: 'https://drive.google.com/drive/folders/folder-id' },
      { id: 'library_zines:3', title: 'External file', url: 'https://example.com/zine.pdf' },
    ],
    {
      results: [
        { resourceId: 'library_zines:1', title: 'Drive file', outcome: 'inaccessible' },
        { resourceId: 'library_zines:2', title: 'Drive folder', outcome: 'unsupported' },
        { resourceId: 'library_zines:3', title: 'External file', outcome: 'available' },
      ],
    },
  );

  assert.deepEqual(result, {
    version: 1,
    failures: [
      { title: 'Drive file', url: 'https://drive.google.com/file/d/file-id/view', cause: 'drive-restricted' },
      { title: 'Drive folder', url: 'https://drive.google.com/drive/folders/folder-id', cause: 'drive-folder' },
    ],
  });
});
