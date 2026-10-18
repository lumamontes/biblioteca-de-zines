import { parseAuthorLinks } from "./author-link-classifier";
import { AuthorLinkPreview } from "./author-link-preview";
import { SocialMediaLink } from "./social-media-link";

interface AuthorLinksProps {
  value: string | null;
}

export function AuthorLinks({ value }: AuthorLinksProps) {
  if (!value) return null;

  const links = parseAuthorLinks(value);
  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3" aria-label="Links relevantes do autor">
      {links.map((link) => {
        const key = `${link.kind}:${link.href}`;

        return link.kind === "social" ? (
          <SocialMediaLink key={key} href={link.href} platform={link.platform} />
        ) : (
          <AuthorLinkPreview key={key} href={link.href} />
        );
      })}
    </div>
  );
}
