import PDFViewer from "@/components/pdf-viewer";
import CategoryBadgeWithLink from "@/components/zine-card/category-badge-with-link";
import { getZineBySlug } from "@/services/zine-service";
import { getPreviewUrl, getThumbnailUrl } from "@/utils/assets";
import { getSlugZineMetadata } from "@/utils/metadata";
import { joinAuthors, getZineCategories } from "@/utils/utils";
import { siteConfig } from "@/app/config/site";
import Link from "next/link";
import { ZineStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { BreadcrumbWrapper } from "@/components/seo/breadcrumb-navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const preview = await getZineBySlug(slug);

  if (!preview) {
    return {
      title: "Zine não encontrada!",
      description: "A zine que você está procurando não foi encontrada.",
    };
  }

  const thumbnailUrl = preview.cover_image 
    ? (getThumbnailUrl(preview.cover_image) || siteConfig.ogImage)
    : siteConfig.ogImage;

  return getSlugZineMetadata(slug, preview, thumbnailUrl);
}

export default async function ZinePreview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const preview = await getZineBySlug(slug);

  if (!preview) {
    return (
      <h3 
        className="text-base px-6 py-3 border border-black hover:bg-neutral-100 transition duration-300 flex items-center justify-center">
        Zine não encontrada!
      </h3>
    );
  }

  const previewUrl = preview.pdf_url ? getPreviewUrl(preview.pdf_url) : "";
  const categories = getZineCategories(preview.tags);

  const breadcrumbItems = [
    { name: "Início", url: siteConfig.url },
    { name: "Zines", url: `${siteConfig.url}/zines` },
    { name: preview.title, url: `${siteConfig.url}/zines/${slug}`, current: true }
  ];

  return (
    <>
      <ZineStructuredData zine={preview} />
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <BreadcrumbWrapper items={breadcrumbItems}>
        <div className="flex min-h-screen flex-col items-center w-full mx-auto p-4 md:p-0 gap-16">
        <p className="text-sm">
          <strong>{preview.title}</strong> por {joinAuthors(preview.library_zines_authors)}
        </p>
      <div className="flex gap-2 flex-wrap justify-center max-w-2xl mx-auto">
      {preview.library_zines_authors.length > 0 && preview.library_zines_authors.map(({authors}) => (
          <Link
            key={authors.id}
            href={authors.slug ? `/authors/${authors.slug}` : authors.url || "#"}
            {...(authors.slug ? {} : { target: "_blank" })}
            className="flex items-center justify-center px-3 py-1.5 text-sm font-medium text-black border border-black rounded-md hover:bg-neutral-100 transition"
          >
            Conhecer autor: {authors.name}
          </Link>
        ))}
      </div>
      {categories.length > 0 && (
        <CategoryBadgeWithLink categories={categories} />
      )}
      <p className="text-sm max-w-xl text-center">{preview.description}</p>
          <div className="bg-neutral-500 w-full h-screen max-w-xl mx-auto overflow-hidden">
            <PDFViewer url={previewUrl} />
          </div>
        </div>
      </BreadcrumbWrapper>
    </>
  );
}
