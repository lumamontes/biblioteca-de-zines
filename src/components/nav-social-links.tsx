import Image from "next/image";
import TelegramIcon from "@public/social/telegram.svg";
import GithubIcon from "@public/social/github.svg";
import EmailIcon from "@public/social/envelope.svg";
import Link from "next/link";

type SocialLink = {
  alt: string;
  src: string;
  href: string;
};
const links: SocialLink[] = [
  {
    alt: "Telegram",
    src: TelegramIcon,
    href: "https://t.me/+-irW84jni8ExYWFh",
  },
  {
    alt: "Github",
    src: GithubIcon,
    href: "https://github.com/lumamontes/biblioteca-de-zines",
  },
  {
    alt: "Email",
    src: EmailIcon,
    href: "mailto:bibliotecadezines@gmail.com",
  },
];

export default function NavSocialLinks() {
  return (
    <nav className="mt-12 md:fixed bottom-16 right-12 p-4">
      <ul className="flex justify-center items-center gap-4 md:flex-col">
        {links.map(({ href, src, alt }, index) => (
          <li key={index} className="list-none">
            <Link href={href} target="_blank" rel="noopener noreferrer">
              <Image
                src={src}
                alt={alt}
                className="p-1 hover:bg-neutral-100 text-red fill-red rounded-md transition-colors duration-300 w-7 h-7"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
