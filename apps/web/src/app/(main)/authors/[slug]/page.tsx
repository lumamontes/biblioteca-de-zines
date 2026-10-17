import { createAuthorReader } from '@/composition/server/author-reader';
import { ZineGridServer } from "@/components/zines/zine-grid-server";
import { AuthorLinks } from "@/components/authors/author-links";
import { notFound } from "next/navigation";
import { getAuthorMetadata } from "@/utils/metadata";
import { getThumbnailUrl } from "@/utils/assets";
import { AuthorStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { siteConfig } from "@/app/config/site";
import { BreadcrumbWrapper } from "@/components/seo/breadcrumb-navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const reader = await createAuthorReader();
  const author = await reader.getBySlug(slug);

  if (!author) {
    return {
      title: "Autor não encontrado",
      description: "O autor que você está procurando não foi encontrado.",
    };
  }

  const zines = await reader.getZines(author.id);
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
  const reader = await createAuthorReader();
  const author = await reader.getBySlug(slug);

  if (!author) {
    notFound();
  }

  const zines = await reader.getZines(author.id);

  const breadcrumbItems = [
    { name: "Início", url: siteConfig.url },
    { name: "Autores", url: `${siteConfig.url}/authors` },
    { name: author.name, url: `${siteConfig.url}/authors/${slug}`, current: true }
  ];
  const navigationBreadcrumbItems = [
    { name: "Início", url: "/" },
    { name: "Autores", url: "/authors" },
    { name: author.name, url: `/authors/${slug}`, current: true }
  ];

  return (
    <>
      <AuthorStructuredData author={author} zines={zines} />
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <BreadcrumbWrapper items={navigationBreadcrumbItems}>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{author.name}</h1>
        
        {author.bio && (
          <p className="text-lg mb-4 max-w-3xl">{author.bio}</p>
        )}

        <AuthorLinks value={author.url} />
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
      </BreadcrumbWrapper>
    </>
  );
}
