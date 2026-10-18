'use client';

import debounce from 'lodash/debounce';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createConfiguredReaderEmbedUrl, DEFAULT_READER_EMBED_CONFIGURATION, type ReaderEmbedConfiguration } from '@biblioteca-de-zines/reader';

export function useEmbedPreview(embedUrl: string, title: string) {
  const [configuration, setConfiguration] = useState(DEFAULT_READER_EMBED_CONFIGURATION);
  const [previewConfiguration, setPreviewConfiguration] = useState(DEFAULT_READER_EMBED_CONFIGURATION);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const configurationRef = useRef(DEFAULT_READER_EMBED_CONFIGURATION);
  const resetCopyStatus = useRef<number | undefined>(undefined);
  const updatePreview = useMemo(() => debounce((next: ReaderEmbedConfiguration) => setPreviewConfiguration(next), 180), []);
  const configuredEmbedUrl = createConfiguredReaderEmbedUrl(embedUrl, configuration);
  const previewUrl = createConfiguredReaderEmbedUrl(embedUrl, previewConfiguration);
  const embedCode = `<iframe src="${configuredEmbedUrl}" title="Leitor de ${title}" width="100%" height="720" loading="lazy" allow="fullscreen" allowfullscreen></iframe>`;

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
    const updated = { ...configurationRef.current, ...next };
    configurationRef.current = updated;
    setConfiguration(updated);
    updatePreview(updated);
  }

  useEffect(() => () => {
    updatePreview.cancel();
    if (resetCopyStatus.current) window.clearTimeout(resetCopyStatus.current);
  }, [updatePreview]);

  return { configuration, copyStatus, copyEmbedCode, embedCode, previewUrl, updateConfiguration };
}
