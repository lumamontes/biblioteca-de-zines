export type SocialPlatform =
  | "facebook"
  | "github"
  | "instagram"
  | "linkedin"
  | "substack"
  | "youtube";

export type ClassifiedAuthorLink =
  | { kind: "social"; platform: SocialPlatform; href: string }
  | { kind: "external"; href: string; hostname: string };
