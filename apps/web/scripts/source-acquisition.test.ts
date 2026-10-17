import assert from 'node:assert/strict';
import test from 'node:test';
import { downloadSource } from '../src/infrastructure/source-acquisition/source-download-service';

test('keeps response declarations distinct from received and detected values', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(Buffer.from('source bytes'), {
    status: 200,
    headers: { 'content-type': 'application/octet-stream', 'content-length': '99' },
  });
  try {
    const source = await downloadSource('https://example.test/path/claimed.pdf');
    assert.equal(source.acquisition?.filename, null);
    assert.equal(source.acquisition?.declaredSize, 99);
    assert.equal(source.acquisition?.receivedByteSize, 12);
    assert.equal(source.acquisition?.declaredMediaType, 'application/octet-stream');
    assert.equal(source.acquisition?.detectedMediaType, 'application/octet-stream');
    assert.match(source.acquisition?.acquiredAt ?? '', /T/);
  } finally {
    globalThis.fetch = previousFetch;
  }
});
