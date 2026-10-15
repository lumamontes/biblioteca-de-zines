import { BookReaderViewer } from '@/components/bookreader-viewer';

export default async function EmbedReaderPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ beta?: string; branding?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  return (
    <BookReaderViewer
      apiOrigin={process.env.NEXT_PUBLIC_READER_API_ORIGIN ?? 'https://biblioteca-de-zines.com.br'}
      betaToken={query.beta}
      branding={query.branding === 'biblioteca'}
      slug={slug}
      surface="embed"
    />
  );
}
