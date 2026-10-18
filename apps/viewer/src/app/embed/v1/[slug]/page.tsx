import { Reader } from '@/components/reader';

export default async function EmbedPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ branding?: string }> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return <Reader branding={query.branding === 'biblioteca'} slug={slug} surface="embed" />;
}
