import { describe, expect, it } from 'vitest';
import { createPublicPublicationReaderInput } from '../../src/components/publication-reader-boundary';
import { createReader } from './reader';

describe('Biblioteca publication reader host boundary', () => {
  it('passes publication metadata and the external PDF as the custom representation', () => {
    const input = createPublicPublicationReaderInput({
      title: 'A public zine',
      creator: 'A zineiro',
      description: 'A description',
      externalPdfUrl: 'https://cdn.example/zine.pdf',
      standardViewerUrl: 'https://drive.google.com/file/d/abc/preview',
    });

    expect(input).toMatchObject({
      publication: { kind: 'pdf', url: 'https://cdn.example/zine.pdf' },
      configuration: { provider: 'direct-pdf', mode: 'slide' },
      metadata: { title: 'A public zine', creator: 'A zineiro', description: 'A description' },
      fallback: { url: 'https://drive.google.com/file/d/abc/preview' },
    });
  });

  it('keeps the standard viewer fallback separate and explicit', () => {
    const input = createPublicPublicationReaderInput({
      title: 'A public zine',
      externalPdfUrl: 'https://cdn.example/zine.pdf',
      standardViewerUrl: 'https://example.com/standard-viewer',
    });

    expect(input.publication).not.toEqual(input.fallback);
    expect(input.fallback.label).toBe('Abrir visualizador padrão');
  });

  it('loads the custom reader from the host input without catalogue dependencies', async () => {
    const input = createPublicPublicationReaderInput({
      title: 'A public zine',
      externalPdfUrl: 'https://cdn.example/zine.pdf',
      standardViewerUrl: 'https://example.com/standard-viewer',
    });
    const reader = createReader(input, {
      'direct-pdf': async (publication) => {
        expect(publication).toEqual({ kind: 'pdf', url: 'https://cdn.example/zine.pdf' });
        return { pageCount: 1, loadPage: async (index) => ({ index, url: 'data:image/png;base64,page' }) };
      },
    });

    await reader.load();

    expect(reader.getState()).toMatchObject({ status: 'ready', metadata: { title: 'A public zine' } });
  });

  it('retains the standard viewer when the external source fails', async () => {
    const input = createPublicPublicationReaderInput({
      title: 'A public zine',
      externalPdfUrl: 'https://cdn.example/not-readable.pdf',
      standardViewerUrl: 'https://example.com/standard-viewer',
    });
    const reader = createReader(input, {
      'direct-pdf': async () => { throw new Error('External PDF is not browser-readable.'); },
    });

    await reader.load();
    expect(reader.getState()).toMatchObject({ status: 'failure', fallback: { url: 'https://example.com/standard-viewer' } });

    reader.useFallback();
    expect(reader.getState()).toMatchObject({ status: 'fallback', reason: 'External PDF is not browser-readable.' });
  });
});
