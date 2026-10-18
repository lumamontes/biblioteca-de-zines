'use client';

import { useEffect, useRef, useState } from 'react';
import { createConfiguredReaderEmbedUrl, DEFAULT_READER_EMBED_CONFIGURATION, type ReaderEmbedConfiguration } from '@biblioteca-de-zines/reader';

export function useEmbedPreview(embedUrl: string, title: string) {
  const [configuration, setConfiguration] = useState(DEFAULT_READER_EMBED_CONFIGURATION);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const resetCopyStatus = useRef<number | undefined>(undefined);
  const previewUrl = createConfiguredReaderEmbedUrl(embedUrl, configuration);
  const embedCode = `<iframe src="${previewUrl}" title="Leitor de ${title}" width="100%" height="720" loading="lazy" allow="fullscreen" allowfullscreen></iframe>`;

  async function copyEmbedCode() {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
    if (resetCopyStatus.current) window.clearTimeout(resetCopyStatus.current);
    resetCopyStatus.current = window.setTimeout(() => setCopyStatus('idle'), 2000);
  }

  function updateConfiguration(next: Partial<ReaderEmbedConfiguration>) {
    setConfiguration((current) => ({ ...current, ...next }));
  }

  useEffect(() => () => {
    if (resetCopyStatus.current) window.clearTimeout(resetCopyStatus.current);
  }, []);

  return { configuration, copyStatus, copyEmbedCode, embedCode, previewUrl, updateConfiguration };
}
