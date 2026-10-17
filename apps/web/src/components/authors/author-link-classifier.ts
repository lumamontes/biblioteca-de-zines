import type { ClassifiedAuthorLink, SocialPlatform } from "./author-link-types";

const SOCIAL_HOSTNAMES: Readonly<Record<string, SocialPlatform>> = {
  "apoia.se": "apoia-se",
  "bandcamp.com": "bandcamp",
  "bsky.app": "bluesky",
  "buymeacoffee.com": "buy-me-a-coffee",
  "catarse.me": "catarse",
  "codeberg.org": "codeberg",
  "dev.to": "devto",
  "facebook.com": "facebook",
  "github.com": "github",
  "gitlab.com": "gitlab",
  "instagram.com": "instagram",
  "itch.io": "itchio",
  "ko-fi.com": "ko-fi",
  "linktr.ee": "linktree",
  "linkedin.com": "linkedin",
  "medium.com": "medium",
  "opencollective.com": "open-collective",
  "patreon.com": "patreon",
  "paypal.me": "paypal",
  "sourcehut.org": "sourcehut",
  "substack.com": "substack",
  "twitter.com": "twitter",
  "vakinha.com.br": "vakinha",
  "x.com": "twitter",
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
    const platform = hostname.includes("mastodon")
      ? "mastodon"
      : SOCIAL_HOSTNAMES[hostname];

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
