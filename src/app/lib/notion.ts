import "server-only";
import { Client } from "@notionhq/client";

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

type Zine = {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  cover: string;
  pdf_url: string;
  author_name: string;
  author_url: string;
};

let cachedZines: Zine[] | null = null;

export const fetchZines = async () => {
  if (cachedZines) {
    return cachedZines;
  }

  try {
    const response = await notion.databases.query({
      database_id: "179c72d974fd8069b715d3020b4f8a52",
    });

    if (!response?.results) {
      return [];
    }

    cachedZines = response.results.map((page) => {
      //@ts-expect-error temporary-fix
      const properties = page.properties
      return {
        id: page.id,
        slug: page.id,
        title: properties["Título"]?.title[0]?.plain_text || "Untitled",
        description: properties["Description"]?.rich_text[0]?.plain_text || "",
        //@ts-expect-error temp fix
        tags: properties["Tags"]?.multi_select.map((tag) => tag.name) || [],
        cover:
          properties["Capa"]?.files[0]?.external?.url ||
          properties["Capa"]?.files[0]?.file?.url ||
          "",
        pdf_url:
          properties["PDF"]?.files[0]?.external?.url ||
          properties["PDF"]?.files[0]?.file?.url ||
          "",
        author_name: properties["Autor"]?.rich_text[0]?.plain_text || "Unknown",
        author_url: properties["Autor"]?.rich_text[0]?.text?.link?.url || "",
      };
    }).filter((zine) => zine.title && zine.title !== "Untitled" && zine.title !== "Unknown");


    return cachedZines;
  } catch (error) {
    console.error("Failed to fetch zines:", error);
    return [];
  }
};


export const fetchZineById = async (id: string) => {
  try {
    const response = await notion.pages.retrieve({
      page_id: id,
    });

    if (!response) {
      return null;
    }
    //@ts-expect-error temporary-fix
    const properties = response.properties;

    return {
      id: response.id,
      slug: response.id,
      title: properties["Título"]?.title[0]?.plain_text || "Untitled",
      description: properties["Description"]?.rich_text[0]?.plain_text || "",
        //@ts-expect-error temporary-fix
      tags: properties["Tags"]?.multi_select.map((tag) => tag.name) || [],
      cover:
        properties["Capa"]?.files[0]?.external?.url ||
        properties["Capa"]?.files[0]?.file?.url ||
        "",
      pdf_url:
        properties["PDF"]?.files[0]?.external?.url ||
        properties["PDF"]?.files[0]?.file?.url ||
        "",
      author_name: properties["Autor"]?.rich_text[0]?.plain_text || "Unknown",
      author_url: properties["author_url"]?.rich_text[0]?.plain_text || "",
    };
  } catch (error) {
    console.error("Failed to fetch zine:", error);
    return null;
  }
}