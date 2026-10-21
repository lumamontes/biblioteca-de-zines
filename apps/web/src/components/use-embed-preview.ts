'use client';

import { useRef, useState } from 'react';

export function useEmbedPreview(embedUrl: string, title: string) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const resetCopyStatus = useRef<number | undefined>(undefined);
  const embedCode = `<iframe src="${embedUrl}" title="Leitor de ${title}" width="100%" height="720" loading="lazy" allow="fullscreen" allowfullscreen></iframe>`;

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

  return { copyStatus, copyEmbedCode, embedCode, previewUrl: embedUrl };
}
