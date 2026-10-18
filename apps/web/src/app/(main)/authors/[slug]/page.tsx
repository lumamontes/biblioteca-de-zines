import { createAuthorReader } from '@/composition/server/author-reader';
import { ZineGridServer } from "@/components/zines/zine-grid-server";
import { AuthorLinks } from "@/components/authors/author-links";
import { notFound } from "next/navigation";
import { getAuthorMetadata } from "@/utils/metadata";
import { getThumbnailUrl } from "@/utils/assets";
import { AuthorStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { siteConfig } from "@/app/config/site";
import { BreadcrumbWrapper } from "@/components/seo/breadcrumb-navigation";
import { cache } from "react";

const getCachedAuthor = cache(async (slug: string) => {
  const reader = await createAuthorReader();
  return reader.getBySlug(slug);
});

const getCachedAuthorPageData = cache(async (slug: string) => {
  const author = await getCachedAuthor(slug);
  if (!author) return null;
  const reader = await createAuthorReader();
  return { author, zines: await reader.getZines(author.id) };
});

const getCachedAuthorMetadataData = cache(async (slug: string) => {
  const author = await getCachedAuthor(slug);
  if (!author) return null;
  const reader = await createAuthorReader();
  return { author, firstZine: await reader.getFirstZine(author.id) };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCachedAuthorMetadataData(slug);

  if (!data) {
    return {
      title: "Autor não encontrado",
      description: "O autor que você está procurando não foi encontrado.",
    };
  }

  const firstZine = data.firstZine;
  const thumbnailUrl = firstZine?.cover_image 
    ? getThumbnailUrl(firstZine.cover_image) 
    : null;

  return getAuthorMetadata(data.author.name, data.author.bio, slug, firstZine, thumbnailUrl);
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCachedAuthorPageData(slug);

  if (!data) {
    notFound();
  }

  const { author, zines } = data;

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
