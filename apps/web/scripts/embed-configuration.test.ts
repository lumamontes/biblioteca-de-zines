import assert from 'node:assert/strict';
import test from 'node:test';
import { createConfiguredReaderEmbedUrl, DEFAULT_READER_EMBED_CONFIGURATION, parseReaderEmbedConfiguration } from '@biblioteca-de-zines/reader';

test('creates the neutral default embed configuration', () => {
  assert.equal(DEFAULT_READER_EMBED_CONFIGURATION.branding, 'none');
  assert.equal(DEFAULT_READER_EMBED_CONFIGURATION.background, '#fafafa');
  assert.equal(DEFAULT_READER_EMBED_CONFIGURATION.text, '#111111');
});

test('serializes embed customization without losing existing viewer parameters', () => {
  const url = createConfiguredReaderEmbedUrl('https://viewer.example/embed/p/sample?mode=2up', {
    background: '#ffffff',
    branding: 'biblioteca',
    text: '#000000',
  });

  assert.equal(url, 'https://viewer.example/embed/p/sample?mode=2up&branding=biblioteca&background=%23ffffff&text=%23000000');
});

test('normalizes invalid public customization values to safe defaults', () => {
  assert.deepEqual(parseReaderEmbedConfiguration({ background: 'red', branding: 'other', text: 'url(javascript:bad)' }), DEFAULT_READER_EMBED_CONFIGURATION);
});
