export function limitText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Decodes HTML entities in a string
 * Converts entities like &#231; (ç), &#227; (ã), &#245; (õ) to their actual characters
 */
export function decodeHtmlEntities(text: string): string {
  // Use the browser's built-in decoder if available (client-side)
  if (typeof window !== "undefined" && window.document) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  }
  
  // Server-side: use a simple replacement for common entities
  // This handles numeric entities like &#231; and named entities like &amp;
  return text
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([a-f\d]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}