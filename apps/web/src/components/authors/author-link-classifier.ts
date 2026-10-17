import type { ClassifiedAuthorLink, SocialPlatform } from "./author-link-types";

const SOCIAL_HOSTNAMES: Readonly<Record<string, SocialPlatform>> = {
  "facebook.com": "facebook",
  "github.com": "github",
  "instagram.com": "instagram",
  "linkedin.com": "linkedin",
  "substack.com": "substack",
  "youtube.com": "youtube",
  "youtu.be": "youtube",
};

function removeWww(hostname: string) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

export function classifyAuthorLink(href: string): ClassifiedAuthorLink {
  try {
    const url = new URL(href);
    const hostname = removeWww(url.hostname);
    const platform = SOCIAL_HOSTNAMES[hostname];

    if (platform) return { kind: "social", platform, href };

    return { kind: "external", href, hostname };
  } catch {
    return { kind: "external", href, hostname: "link" };
  }
}

export function parseAuthorLinks(value: string) {
  return value
    .split(/,\s+(?=https?:\/\/)/i)
    .map((link) => link.trim())
    .filter(Boolean)
    .map(classifyAuthorLink);
}
