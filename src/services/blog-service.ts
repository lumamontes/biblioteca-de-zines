import { BlogArticle } from "@/@types/blog";
import * as cheerio from "cheerio";
import { decodeHtmlEntities } from "@/utils/string";

const SUBSTACK_RSS_URL = "https://bibliotecadezines.substack.com/feed";

/**
 * Fetches and parses Substack RSS feed
 * @returns Array of blog articles
 */
export async function getBlogArticles(): Promise<BlogArticle[]> {
  try {
    const response = await fetch(SUBSTACK_RSS_URL, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch RSS feed:", response.statusText);
      return [];
    }

    const xml = await response.text();
    const $ = cheerio.load(xml, { xmlMode: true });

    const articles: BlogArticle[] = [];

    $("item").each((_, element) => {
      const $item = $(element);
      
      const title = $item.find("title").text().trim();
      const link = $item.find("link").text().trim();
      const pubDate = $item.find("pubDate").text().trim();
      const description = $item.find("description").text().trim();
      
      // Try to extract image from content:encoded or description
      let image: string | undefined;
      let contentEncoded = "";
      
      // Try different ways to find content:encoded (namespaced element)
      const contentElement = $item.find("*").filter((_, el) => {
        const tagName = $(el).prop("tagName") || "";
        return tagName.toLowerCase().includes("encoded") || 
               tagName.toLowerCase() === "content:encoded";
      });
      
      if (contentElement.length > 0) {
        contentEncoded = contentElement.first().text();
      }
      
      // Also try direct text search in the item's HTML
      const itemHtml = $item.html() || "";
      const encodedMatch = itemHtml.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i);
      if (encodedMatch) {
        contentEncoded = encodedMatch[1];
      }
      
      const content = contentEncoded || description;
      
      if (content) {
        const $content = cheerio.load(content);
        const imgSrc = $content("img").first().attr("src");
        if (imgSrc) {
          image = imgSrc;
        }
      }

      // Fallback: try to get image from media:content or enclosure
      if (!image) {
        const enclosure = $item.find("enclosure");
        if (enclosure.length > 0) {
          const enclosureType = enclosure.attr("type");
          if (enclosureType?.startsWith("image/")) {
            image = enclosure.attr("url") || undefined;
          }
        }
      }

      if (title && link) {
        articles.push({
          title: decodeHtmlEntities(title),
          link,
          pubDate,
          description: decodeHtmlEntities(description || ""),
          image,
          content: contentEncoded,
        });
      }
    });

    return articles;
  } catch (error) {
    console.error("Error fetching blog articles:", error);
    return [];
  }
}

