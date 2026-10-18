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

  const socialLinks = links.filter((link) => link.kind === "social");
  const previewLinks = links.filter((link) => link.kind === "external");

  const renderLink = (link: (typeof links)[number]) => {
    const key = `${link.kind}:${link.href}`;

    return link.kind === "social" ? (
      <SocialMediaLink key={key} href={link.href} platform={link.platform} />
    ) : (
      <AuthorLinkPreview key={key} href={link.href} />
    );
  };

  return (
    <div className="flex flex-col gap-4" aria-label="Links relevantes do autor">
      {socialLinks.length > 0 && (
        <section className="flex flex-wrap items-start gap-3" aria-label="Redes sociais e apoio">
          {socialLinks.map(renderLink)}
        </section>
      )}
      {previewLinks.length > 0 && (
        <section className="flex flex-wrap items-start gap-3" aria-label="Sites e publicações">
          {previewLinks.map(renderLink)}
        </section>
      )}
    </div>
  );
}
