import { parseAuthorLinks } from "./author-link-classifier";
import { AuthorLinkPreview } from "./author-link-preview";
import { ExternalLink } from "./external-link";
import { SocialMediaLink } from "./social-media-link";
import { readLinkMetadata } from "@/infrastructure/source-acquisition/link-metadata-reader";

interface AuthorLinksProps {
  value: string | null;
}

export async function AuthorLinks({ value }: AuthorLinksProps) {
  if (!value) return null;

  const links = parseAuthorLinks(value);
  if (links.length === 0) return null;

  const socialLinks = links.filter((link) => link.kind === "social");
  const externalLinks = await Promise.all(
    links
      .filter((link) => link.kind === "external")
      .map(async (link) => ({ link, metadata: await readLinkMetadata(link.href) })),
  );
  const compactLinks = externalLinks.filter(({ metadata }) => !metadata.hasPreview);
  const previewLinks = externalLinks.filter(({ metadata }) => metadata.hasPreview);

  const renderSocialLink = (link: (typeof socialLinks)[number]) => {
    const key = `${link.kind}:${link.href}`;

    return <SocialMediaLink key={key} href={link.href} platform={link.platform} />;
  };

  return (
    <div className="flex flex-col gap-5" aria-label="Links relevantes do autor">
      {(socialLinks.length > 0 || compactLinks.length > 0) && (
        <section className="flex flex-wrap items-start gap-3" aria-label="Links diretos do autor">
          {socialLinks.map(renderSocialLink)}
          {compactLinks.map(({ link }) => (
            <ExternalLink key={`${link.kind}:${link.href}`} href={link.href} />
          ))}
        </section>
      )}
      {previewLinks.length > 0 && (
        <section className="grid grid-cols-1 gap-4 border-t border-neutral-200 pt-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Sites e publicações">
          {previewLinks.map(({ link, metadata }) => (
            <AuthorLinkPreview key={`${link.kind}:${link.href}`} href={link.href} metadata={metadata} />
          ))}
        </section>
      )}
    </div>
  );
}
