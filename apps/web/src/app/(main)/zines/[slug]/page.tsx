import { getZineBySlug } from "@/services/zine-service";
import { getPreviewUrl, getThumbnailUrl } from "@/utils/assets";
import { getSlugZineMetadata } from "@/utils/metadata";
import { getZineCategories } from "@/utils/utils";
import { siteConfig } from "@/app/config/site";
import { ZineStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { BreadcrumbNavigation, BreadcrumbWrapper } from "@/components/seo/breadcrumb-navigation";
import { createViewerRolloutConfig } from "@/application/reader/viewer-rollout";
import { getViewerReader } from "@/composition/server/public-reader";
import { createZineReadingSurface } from "@/application/reader/reading-surface.service";
import { ZineReadingSurfaceView } from "@/components/zine-reading-surface-view.component";
import { redirect } from "next/navigation";
import { ZineDetails } from "@/components/zine-details";

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

  if (preview.slug && preview.slug !== slug) redirect(`/zines/${preview.slug}`);

  const thumbnailUrl = preview.cover_image 
    ? (getThumbnailUrl(preview.cover_image) || siteConfig.ogImage)
    : siteConfig.ogImage;

  return getSlugZineMetadata(slug, preview, thumbnailUrl);
}

export default async function ZinePreview({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const preview = await getZineBySlug(slug);

  if (!preview) {
    return (
      <h3 
        className="text-base px-6 py-3 border border-black hover:bg-neutral-100 transition duration-300 flex items-center justify-center">
        Zine não encontrada!
      </h3>
    );
  }

  if (preview.slug && preview.slug !== slug) redirect(`/zines/${preview.slug}`);

  const previewUrl = preview.pdf_url ? getPreviewUrl(preview.pdf_url) : "";
  const rollout = createViewerRolloutConfig(process.env);
  const reader = rollout.enabled
    ? await getViewerReader(slug, rollout).catch(() => null)
    : null;
  const readingSurface = createZineReadingSurface({
    pdfUrl: previewUrl,
    title: preview.title,
    viewerOrigin: process.env.READER_VIEWER_ORIGIN,
    reader: reader ?? { status: "unavailable" },
  });
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
      <BreadcrumbWrapper className="lg:flex lg:h-[calc(100dvh-5rem)] lg:flex-col lg:overflow-hidden" items={breadcrumbItems} showNavigation={false}>
        <div className="reading-layout-page flex min-h-0 w-full flex-1 flex-col items-center gap-8 p-4 md:p-0 lg:overflow-hidden">
          <ZineReadingSurfaceView
            initialMode={query.view === "reader" ? "beta" : "pdf"}
            sidebar={<ZineDetails categories={categories} zine={preview} />}
            sidebarHeader={<BreadcrumbNavigation truncateCurrent items={breadcrumbItems} className="!mx-0 !mb-0 !max-w-none !min-w-0 !px-0 !pt-0 text-xs" />}
            surface={readingSurface}
          />
        </div>
      </BreadcrumbWrapper>
    </>
  );
}
