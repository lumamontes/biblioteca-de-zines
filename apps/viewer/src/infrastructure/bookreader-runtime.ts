import type { BookReaderFactory } from './bookreader-types';

const BOOKREADER_CDN = 'https://cdn.jsdelivr.net/npm/@internetarchive/bookreader@5.0.0-87/BookReader';
const JQUERY_URL = 'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js';
let runtimePromise: Promise<void> | undefined;

export async function loadBookReaderRuntime(): Promise<void> {
  if (window.BookReader) return;
  runtimePromise ??= loadAsset(JQUERY_URL, 'script').then(() => Promise.all([
    loadAsset(`${BOOKREADER_CDN}/BookReader.js`, 'script'),
    loadAsset(`${BOOKREADER_CDN}/BookReader.css`, 'style'),
  ])).then(() => undefined);
  try {
    await runtimePromise;
    if (!window.BookReader) throw new Error('BookReader runtime is unavailable');
  } catch (error) {
    runtimePromise = undefined;
    throw error;
  }
}

export function getBookReaderFactory(): BookReaderFactory {
  if (!window.BookReader) throw new Error('BookReader runtime is unavailable');
  return window.BookReader;
}

function loadAsset(url: string, kind: 'script' | 'style'): Promise<void> {
  const existing = document.querySelector(`[data-reader-asset="${url}"]`);
  if (existing) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const asset = kind === 'script' ? document.createElement('script') : document.createElement('link');
    if (kind === 'script') {
      asset.setAttribute('src', url);
      (asset as HTMLScriptElement).async = true;
    } else {
      asset.setAttribute('rel', 'stylesheet');
      asset.setAttribute('href', url);
    }
    asset.setAttribute('data-reader-asset', url);
    asset.addEventListener('load', () => resolve(), { once: true });
    asset.addEventListener('error', () => reject(new Error(`Failed to load reader asset: ${url}`)), { once: true });
    document.head.appendChild(asset);
  });
}
