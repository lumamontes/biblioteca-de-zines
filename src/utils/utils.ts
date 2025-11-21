import { LibraryZinesAuthors, ZineTags } from "@/@types/zine";
import { Json } from "@/types/database.types";
import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

export function limitText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function joinAuthors(
  library_zines_authors: LibraryZinesAuthors
): string {
  if(!library_zines_authors || library_zines_authors.length === 0) {
    return "";
  }
  if(library_zines_authors.length > 3) {
    const firstThree = library_zines_authors.slice(0, 2).map((a) => a.authors.name);
    return `${firstThree.join(", ")} e mais ${library_zines_authors.length - 2}`;
  }
  return library_zines_authors.map((a) => a.authors.name).join(", ");
}

export function getZineCategories(tags: Json): string[] {
  if (!tags) return [];
  
  const parsedTags = parseTags(tags);
  
  return parsedTags?.categories || [];
}

export function isValidTagsObject(value: unknown): value is ZineTags {
  return typeof value === 'object' && value !== null;
}

export function parseTags(tags: unknown): ZineTags {
  if (!tags) return {};
  
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      return isValidTagsObject(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  
  return isValidTagsObject(tags) ? tags : {};
}