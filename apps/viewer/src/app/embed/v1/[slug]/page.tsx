import { parseReaderEmbedConfiguration } from '@biblioteca-de-zines/reader-contracts';
import { Reader } from '@/components/reader';
import type { ReaderViewMode } from '@/application/reader-types';

export default async function EmbedPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ branding?: string; background?: string; mode?: string; page?: string; text?: string }> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const mode: ReaderViewMode = query.mode === '1up' ? '1up' : '2up';
  const page = Number.parseInt(query.page ?? '1', 10);
  const configuration = parseReaderEmbedConfiguration(query);
  return <Reader branding={configuration.branding} mode={mode} page={Number.isFinite(page) && page > 0 ? page : 1} slug={slug} surface="embed" theme={configuration} />;
}
