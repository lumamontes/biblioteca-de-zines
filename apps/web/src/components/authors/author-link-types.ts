export type SocialPlatform =
  | "apoia-se"
  | "bandcamp"
  | "bluesky"
  | "buy-me-a-coffee"
  | "catarse"
  | "codeberg"
  | "devto"
  | "facebook"
  | "github"
  | "gitlab"
  | "instagram"
  | "itchio"
  | "ko-fi"
  | "linktree"
  | "linkedin"
  | "mastodon"
  | "medium"
  | "open-collective"
  | "patreon"
  | "paypal"
  | "sourcehut"
  | "substack"
  | "twitter"
  | "vakinha"
  | "youtube";

export type ClassifiedAuthorLink =
  | { kind: "social"; platform: SocialPlatform; href: string }
  | { kind: "external"; href: string; hostname: string };
