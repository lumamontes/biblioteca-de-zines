import { parseReaderEmbedConfiguration } from '@biblioteca-de-zines/reader';
import { Reader } from '@/components/reader';
import type { ReaderViewMode } from '@/application/reader-types';

export default async function ViewerPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ branding?: string; mode?: string; page?: string }> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const mode: ReaderViewMode = query.mode === '1up' ? '1up' : '2up';
  const configuration = parseReaderEmbedConfiguration(query);
  const page = Number.parseInt(query.page ?? '1', 10);
  return <Reader branding={configuration.branding} mode={mode} page={Number.isFinite(page) && page > 0 ? page : 1} slug={slug} surface="standalone" theme={configuration} />;
}
