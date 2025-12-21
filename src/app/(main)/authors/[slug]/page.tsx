import { getAuthorBySlug, getAuthorZines } from "@/services/author-service";
import { ZineGridServer } from "@/components/zines/zine-grid-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAuthorMetadata } from "@/utils/metadata";
import { getThumbnailUrl } from "@/utils/assets";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) {
    return {
      title: "Autor não encontrado",
      description: "O autor que você está procurando não foi encontrado.",
    };
  }

  const zines = await getAuthorZines(author.id);
  const firstZine = zines.length > 0 ? zines[0] : null;
  const thumbnailUrl = firstZine?.cover_image 
    ? getThumbnailUrl(firstZine.cover_image) 
    : null;

  return getAuthorMetadata(author.name, author.bio, slug, firstZine, thumbnailUrl);
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  const zines = await getAuthorZines(author.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{author.name}</h1>
        
        {author.bio && (
          <p className="text-lg mb-4 max-w-3xl">{author.bio}</p>
        )}

        {author.url && (
          <div className="mb-4">
            <Link
              href={author.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-black border border-black rounded-md hover:bg-neutral-100 transition-colors"
            >
              Visitar site do autor
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">
          Zines de {author.name} ({zines.length})
        </h2>
        
        {zines.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              Este autor ainda não tem zines publicados.
            </p>
          </div>
        ) : (
          <ZineGridServer zines={zines} />
        )}
      </section>
    </div>
  );
}

