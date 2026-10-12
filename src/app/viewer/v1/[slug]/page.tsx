import { BookReaderViewer } from '@/components/bookreader-viewer';

export default async function ViewerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <BookReaderViewer
      apiOrigin={process.env.NEXT_PUBLIC_READER_API_ORIGIN ?? 'https://biblioteca-de-zines.com.br'}
      slug={slug}
      surface="reader"
    />
  );
}
