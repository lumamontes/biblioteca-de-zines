import * as cheerio from "cheerio";
import { AUTHOR_LINK_METADATA_CACHE_TAG, type LinkMetadata } from "./link-metadata-types";

const MAX_RESPONSE_BYTES = 512 * 1024;
const MAX_REDIRECTS = 3;
// Author links are stable; refresh previews monthly instead of fetching on normal page visits.
const METADATA_CACHE_SECONDS = 60 * 60 * 24 * 30;

function normalizeHostname(hostname: string) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

function isSafeMetadataUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (hostname === "localhost" || hostname.endsWith(".localhost")) return false;
    if (hostname.endsWith(".local") || hostname.endsWith(".internal")) return false;
    if (/^(127\.|10\.|192\.168\.|169\.254\.)/.test(hostname)) return false;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) return false;

    return true;
  } catch {
    return false;
  }
}

function createFallbackMetadata(url: string): LinkMetadata {
  const parsedUrl = new URL(url);
  const domain = normalizeHostname(parsedUrl.hostname);

  return {
    title: getKnownSiteTitle(domain, url),
    description: getKnownSiteDescription(domain),
    image: getKnownSiteImage(domain),
    domain,
    favicon: `${parsedUrl.origin}/favicon.ico`,
    siteName: getKnownSiteName(domain),
  };
}

async function readResponseBody(response: Response) {
  if (!response.body) return null;

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      size += value.byteLength;
      if (size > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(body);
}

async function fetchMetadataHtml(url: string) {
  let currentUrl = url;

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    if (!isSafeMetadataUrl(currentUrl)) return null;

    const response = await fetch(currentUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "BibliotecaDeZinesLinkPreview/1.0",
      },
      next: {
        revalidate: METADATA_CACHE_SECONDS,
        tags: [AUTHOR_LINK_METADATA_CACHE_TAG],
      },
      signal: AbortSignal.timeout(3000),
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return null;
      currentUrl = new URL(location, currentUrl).href;
      continue;
    }

    if (!response.ok) return null;
    if (!response.headers.get("content-type")?.includes("text/html")) return null;

    return { html: await readResponseBody(response), url: currentUrl };
  }

  return null;
}

export async function readLinkMetadata(url: string): Promise<LinkMetadata> {
  const fallbackMetadata = createFallbackMetadata(url);
  if (!isSafeMetadataUrl(url)) return fallbackMetadata;

  try {
    const fetched = await fetchMetadataHtml(url);
    if (!fetched?.html) return fallbackMetadata;

    const $ = cheerio.load(fetched.html);
    const title = getMetaContent($, "og:title", "twitter:title") || $("title").text();
    const description =
      getMetaContent($, "og:description", "twitter:description") ||
      $("meta[name=description]").attr("content") ||
      fallbackMetadata.description;
    const image = getMetaContent($, "og:image", "og:image:secure_url", "twitter:image");
    const siteName = getMetaContent($, "og:site_name") || fallbackMetadata.siteName;
    const absoluteImage = image ? new URL(image, fetched.url).href : fallbackMetadata.image;

    return {
      ...fallbackMetadata,
      title: normalizeText(title) || fallbackMetadata.title,
      description: normalizeText(description) || fallbackMetadata.description,
      image: absoluteImage,
      siteName: normalizeText(siteName) || fallbackMetadata.siteName,
    };
  } catch {
    return fallbackMetadata;
  }
}

function getMetaContent($: cheerio.CheerioAPI, ...names: string[]) {
  for (const name of names) {
    const content =
      $(`meta[property="${name}"]`).attr("content") ||
      $(`meta[name="${name}"]`).attr("content");
    if (content) return content;
  }
  return "";
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function getKnownSiteTitle(domain: string, url: string): string {
  const knownTitles: Record<string, string> = {
    "instagram.com": "O Norte em Quadrinhos entrevista Luana Góes sobre a Biblioteca Brasileira de Zines",
    "youtube.com": url.includes("/live/") ? "Live sobre Biblioteca de Zines" : "Vídeo sobre Biblioteca de Zines",
    "dropsdejogos.uai.com.br": "Biblioteca de Zines reúne obras indie do BR para ler de graça",
    "hqpop.com.br": "Descubra a Biblioteca Brasileira de Zines: A Nova Casa da Arte Independente",
  };

  if (domain === "g1.globo.com") {
    if (url.includes("/2026/05/28/")) return "HQ e plataforma de zines produzidas por amapaenses são destaque em prêmio nacional";
    if (url.includes("/2026/10/14/")) return "Biblioteca virtual reúne mais de 300 zines gratuitos e amplia acesso à produção independente no AP";
  }

  return knownTitles[domain] || `Menção na mídia - ${domain}`;
}

function getKnownSiteDescription(domain: string): string {
  const knownDescriptions: Record<string, string> = {
    "instagram.com": "O Norte em Quadrinhos entrevistou a artista multimídia, natural do Amapá, idealizadora da Biblioteca Brasileira de Zines, projeto que criou uma forma de catalogar online a produção de fanzines brasileira.",
    "youtube.com": "Conteúdo em vídeo sobre a Biblioteca de Zines",
    "dropsdejogos.uai.com.br": "Reportagem sobre zines brasileiros independentes",
    "hqpop.com.br": "Artigo sobre a nova casa da arte independente brasileira",
    "g1.globo.com": "Reportagem do g1 sobre a Biblioteca de Zines e a produção independente no Amapá",
  };

  return knownDescriptions[domain] || `Conteúdo sobre a Biblioteca de Zines em ${domain}`;
}

function getKnownSiteImage(domain: string): string {
  if (domain === "hqpop.com.br") return "https://hqpop.com.br/wp-content/uploads/2025/01/hqpop_bibliotecadezines_2401.jpg";
  return "";
}

function getKnownSiteName(domain: string): string {
  const knownSiteNames: Record<string, string> = {
    "instagram.com": "Instagram",
    "youtube.com": "YouTube",
    "dropsdejogos.uai.com.br": "Drops de Jogos",
    "hqpop.com.br": "HQ Pop",
  };

  return knownSiteNames[domain] || domain;
}
