'use client';

import { createBookReaderRenderer } from '@/infrastructure/reader/bookreader-adapter';
import type { BookReaderFactory } from '@/infrastructure/reader/bookreader-adapter-types';

const BOOKREADER_VERSION = '5.0.0-87';
const BOOKREADER_CDN = `https://cdn.jsdelivr.net/npm/@internetarchive/bookreader@${BOOKREADER_VERSION}/BookReader`;

export async function createClientBookReaderRenderer() {
  await loadBookReaderScript();
  await loadBookReaderStyles();

  const factory: BookReaderFactory = (options) => new window.BookReader(options);
  return createBookReaderRenderer(factory);
}

function loadBookReaderScript(): Promise<void> {
  const src = `${BOOKREADER_CDN}/BookReader.js`;
  if (window.BookReader) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('BookReader script failed to load')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('BookReader script failed to load'));
    document.head.appendChild(script);
  });
}

function loadBookReaderStyles(): Promise<void> {
  const href = `${BOOKREADER_CDN}/BookReader.css`;
  if (document.querySelector(`link[href="${href}"]`)) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error('BookReader styles failed to load'));
    document.head.appendChild(link);
  });
}
