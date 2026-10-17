import NavSocialLinks from "@/components/nav-social-links";
import Image from "next/image";
import Link from "next/link";
import { getRandomZine } from "@/services/zine-service";
import { getThumbnailUrl } from "@/utils/assets";
import SiteHeader from "@/components/site-header";
import { PostItZineInfo } from "@/components/ui/post-it";
import { MediaMention } from "@/components/media-mention";
import { WebsiteStructuredData } from "@/components/seo/structured-data";
import { siteConfig } from "./config/site";
import type { Metadata } from "next";
import SafeImage from "@/components/safe-image";
import { joinAuthors } from "@/utils/utils";

export const metadata: Metadata = {
  title: `${siteConfig.name} - Arquivo Digital de Zines Brasileiros e Latino-Americanos`,
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    url: siteConfig.url,
  },
}

const PLACEHOLDER_COVER_IMAGE = "/home-gif.gif";


const PUBLICATION_LINKS = [
  "https://www.instagram.com/p/DGG5aOIRRVI/?igsh=cmt4d2xhbWl6MWN6&img_index=2",
  // "https://www.youtube.com/live/woWFBtIE_Gs",
  "https://dropsdejogos.uai.com.br/noticias/indie/biblioteca-de-zines-reune-obras-indie-do-br-para-ler-de-graca/",
  "https://hqpop.com.br/descubra-a-biblioteca-brasileira-de-zines-a-nova-casa-da-arte-independente/",
  "https://g1.globo.com/ap/amapa/noticia/2026/05/28/hq-e-plataforma-de-zines-produzidas-por-amapaenses-sao-destaque-em-premio-nacional.ghtml",
  "https://g1.globo.com/ap/amapa/noticia/2026/10/14/biblioteca-virtual-reune-mais-de-300-zines-gratuitos-e-amplia-acesso-a-producao-independente-no-ap.ghtml",
  // "https://www.youtube.com/watch?v=ytK3c0utVE8"
];

function getMediaType(url: string): 'instagram' | 'youtube' | 'article' {
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('youtube.com')) return 'youtube';
  return 'article';
}

export default async function HomePage() {
  const randomZine = await getRandomZine();

  const thumbnailUrl = randomZine && randomZine.cover_image 
    ? (getThumbnailUrl(randomZine.cover_image) || PLACEHOLDER_COVER_IMAGE)
    : PLACEHOLDER_COVER_IMAGE;
  
  return (
    <>
      <WebsiteStructuredData />
      <SiteHeader />

      <div className="pt-20 flex min-h-screen items-center max-w-6xl mx-auto px-4 md:px-12 justify-between flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-12 md:p-0">
          <div className="flex gap-6 flex-col">
            <h1 className="hidden text-5xl md:text-6xl font-black leading-tight">
              <span className="inline-block bg-zine-green px-2 py-1 shadow-lg border-2 border-black transform rotate-1">
                Biblioteca
              </span>
              <br />
              <span className="inline-block bg-zine-yellow px-2 py-1 shadow-lg border-2 border-black transform -rotate-1 mt-2">
                de Zines
              </span>
            </h1>
            <Image
              src={'/logo.png'}
              alt="Gif com Logo da biblioteca de zines"
              width={500}
              height={200}
            />
              <p className="text-base font-medium leading-relaxed">
                Uma biblioteca virtual e código aberto para catalogar e arquivar iniciativas
                independentes em formato de zine
              </p>
            
            {/* CTA Button with punk style */}
            <div className="mt-6">
              <Link
                href="/zines"
                className="bg-black inline-block text-base font-bold px-8 py-4 border-2 border-black text-white transform hover:rotate-1 hover:scale-105 transition-all duration-200  ]"
              >
                EXPLORAR :)
              </Link>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end mt-10 md:mt-0 p-8 ">
          {randomZine ? (
            <div className="relative group perspective-1000">
              <div className="relative transform hover:scale-105  transition-all duration-300 cursor-pointer group-hover:shadow-2xl">
                <div className="bg-white p-3 shadow-xl border border-gray-200 transform rotate-1 hover:rotate-2 transition-transform duration-300">
                  <div className="relative aspect-[4/5] w-[300px] max-w-full overflow-hidden">
                    <SafeImage
                      src={thumbnailUrl}
                      alt={randomZine.title}
                      width={300}
                      height={375}
                      loading="eager"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </div>
                
                  <PostItZineInfo
                    title={randomZine.title}
                    authors={joinAuthors(randomZine.library_zines_authors) || "Autor desconhecido"}
                    slug={randomZine.slug || ""}
                    className="max-w-xs"
                  />
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="bg-white p-4 transform rotate-3 shadow-xl border border-gray-200">
                <Image
                  src="/home-gif.gif"
                  alt="Logo da biblioteca de zines"
                  width={301}
                  height={288}
                  loading="lazy"
                  className="transform -rotate-1"
                />
                <p className="text-xs font-mono text-center mt-2 transform rotate-1">📚 DIY Library</p>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-6 right-6 z-40">
          <NavSocialLinks />
        </div>
      </div>
      
      {/* Na Mídia Section */}
      <div className="py-16 bg-white ">
        <div className="max-w-6xl mx-auto px-4 md:px-12 mb-8">
          <div className="text-center">
            {/* Zine-style title */}
              <h2 className="text-3xl md:text-4xl  px-6 py-3 border-2transform -rotate-1">
                Na Mídia
              </h2>
          </div>
        </div>
          
          <div className="max-w-6xl mx-auto px-4 md:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
            {PUBLICATION_LINKS.map((link) => (
              <MediaMention key={link} url={link} type={getMediaType(link)} />
            ))}
          </div>
      </div>
      
      {/* //seção clubes de zines */}
      <div className="py-16 bg-zine-lightyellow">
        <div className="max-w-6xl mx-auto px-4 md:px-12 mb-8">
          <div className="text-center">
            {/* Zine-style title */}
              <h2 className="text-3xl md:text-4xl  px-6 py-3 border-2transform -rotate-1">
                #ClubeDeZines
              </h2>
              <p>
                Um clubinho online para criar zines a partir de temas coletivos, e tudo é aberto à sua interpretação!
              </p>
          </div>
          <Image 
            src="/clubedezines.png" 
            alt="Clube de Zines" 
            width={400} 
            height={200} 
            className="mx-auto mt-8 "
          />
        </div>
        <div className="text-center">
          <Link
            href="/zines-club"
            className="bg-black inline-block text-base font-bold px-8 py-4 border-2 border-black text-white transform hover:rotate-1 hover:scale-105 transition-all duration-200  ]"
          >
            PARTICIPAR DO CLUBE :)
          </Link>
        </div>
      </div>
            
    </>
  );
}
