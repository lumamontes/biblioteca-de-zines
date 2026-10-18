import FilteredZines from "@/components/zines/filtered-zines";
import { getCategories } from "@/services/categories-service";
import { getPublishedZines } from "@/services/zine-service";
import { WebsiteStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { siteConfig } from "@/app/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Explorar Zines - ${siteConfig.name}`,
  description: "Descubra zines brasileiros e latino-americanos. Arte independente, publicações underground e cultura DIY de artistas emergentes.",
  alternates: {
    canonical: `${siteConfig.url}/zines`,
  },
  openGraph: {
    url: `${siteConfig.url}/zines`,
  },
};

export default async function Zines() {
  const { zines, totalCount } = await getPublishedZines();
  const categories = await getCategories();

  if (!zines?.length) {
    return <output>Não há zines publicados no momento.</output>;
  }

  return (
    <>
      <WebsiteStructuredData 
        title={`Explorar Zines - ${siteConfig.name}`}
        description="Descubra zines brasileiros e latino-americanos"
        url={`${siteConfig.url}/zines`}
      />
      <BreadcrumbStructuredData 
        items={[
          { name: "Início", url: siteConfig.url },
          { name: "Zines", url: `${siteConfig.url}/zines` }
        ]} 
      />
      <FilteredZines initialZines={zines} initialTotalCount={totalCount} categories={categories}/>
    </>
  );
}
