import type { ImagePage, ReaderInput } from './contract';

function fixturePage(index: number): ImagePage {
  const paper = index % 2 ? '#d7e7dc' : '#f2c078';
  const ink = index % 2 ? '#17352d' : '#302016';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="840" viewBox="0 0 600 840"><rect width="600" height="840" fill="${paper}"/><circle cx="450" cy="170" r="120" fill="${ink}" opacity=".14"/><path d="M70 640 C190 390 300 720 530 300" fill="none" stroke="${ink}" stroke-width="25"/><text x="70" y="110" fill="${ink}" font-family="Georgia" font-size="34">Fixture zine</text><text x="70" y="770" fill="${ink}" font-family="system-ui" font-size="25">Page ${index + 1}</text></svg>`;
  return { url: `data:image/svg+xml,${encodeURIComponent(svg)}`, alt: `Fixture zine page ${index + 1}` };
}

export const imageFixture: ReaderInput = {
  publication: {
    kind: 'image-pages',
    pages: Array.from({ length: 6 }, (_, index) => fixturePage(index)),
  },
  configuration: { provider: 'ordered-images', mode: 'page-turn' },
  metadata: {
    title: 'A small fixture zine',
    creator: 'Biblioteca de Zines',
    description: 'Six ordered page images exercise the public reader boundary.',
  },
  fallback: { url: 'https://example.com/fixture-zine.pdf', label: 'Open standard viewer' },
};

export const incompatiblePdfFixture: ReaderInput = {
  publication: {
    kind: 'pdf',
    url: 'https://example.com/not-a-browser-readable-pdf',
  },
  configuration: { provider: 'direct-pdf', mode: 'slide' },
  metadata: {
    title: 'An incompatible external PDF',
    description: 'This fixture demonstrates an explicit failure and fallback.',
  },
  fallback: { url: 'https://example.com/publication.pdf', label: 'Open standard viewer' },
};
