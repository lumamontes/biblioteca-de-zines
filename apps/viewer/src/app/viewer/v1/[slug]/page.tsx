import { Reader } from '@/components/reader';

export default async function ViewerPage({ params }: { params: Promise<{ slug: string }> }) {
  return <Reader slug={(await params).slug} surface="reader" />;
}
