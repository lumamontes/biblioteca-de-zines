"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SocialLink = {
  alt: string;
  src: string;
  href: string;
};
const links: SocialLink[] = [
  {
    alt: "Telegram",
    src: "/social/telegram.svg",
    href: "https://t.me/+-irW84jni8ExYWFh",
  },
  {
    alt: "Github",
    src: "/social/github.svg",
    href: "https://github.com/lumamontes/biblioteca-de-zines",
  },
  {
    alt: "Newsletter",
    src: "/social/envelope.svg",
    href: "https://bibliotecadezines.substack.com/",
  },
  {
    alt: "Instagram",
    src: "/social/instagram.svg",
    href: "https://www.instagram.com/bibliotecadezines/",
  }
];

export default function NavSocialLinks() {
  const pathname = usePathname();
  const isZineReaderPage = /^\/zines\/[^/]+$/.test(pathname);

  return (
    <nav
      className={`mt-12 p-4 md:fixed md:bottom-16 ${isZineReaderPage ? "md:hidden" : "md:right-12"}`}
    >
      <ul className="flex items-center justify-center gap-4 md:flex-col">
        {links.map(({ href, src, alt }, index) => (
          <li key={index} className="list-none">
            <Link href={href} target="_blank" rel="noopener noreferrer">
              <Image
                src={src}
                alt={alt}
                width={28}
                height={28}
                className="h-7 w-7 rounded-md p-1 text-red fill-red transition-colors duration-300 hover:bg-neutral-100"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
