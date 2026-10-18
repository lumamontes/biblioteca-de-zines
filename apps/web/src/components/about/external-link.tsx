export const ExternalLink = ({ title, description, url }: { title: string; description: string; url: string }) => (
  <li>
    <strong>{title}</strong> {description}{" "}
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-neutral-300 transition-colors"
    >
      Acesse aqui
    </a>
  </li>
);