export type SocialPlatform =
  | "bandcamp"
  | "bluesky"
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
  | "patreon"
  | "sourcehut"
  | "substack"
  | "twitter"
  | "youtube";

export type ClassifiedAuthorLink =
  | { kind: "social"; platform: SocialPlatform; href: string }
  | { kind: "external"; href: string; hostname: string };
