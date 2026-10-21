"use client";

import Image from "next/image";
import TelegramIcon from "@public/social/telegram.svg";
import GithubIcon from "@public/social/github.svg";
import EmailIcon from "@public/social/envelope.svg";
import InstagramIcon from "@public/social/instagram.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
    alt: "Newsletter",
    src: EmailIcon,
    href: "https://bibliotecadezines.substack.com/",
  },
  {
    alt: "Instagram",
    src: InstagramIcon,
    href: "https://www.instagram.com/bibliotecadezines/",
  }
];

export default function NavSocialLinks() {
  const [isOverlapping, setIsOverlapping] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    let frame: number | undefined;

    function measureOverlap() {
      frame = undefined;
      if (!mediaQuery.matches) {
        setIsOverlapping(false);
        return;
      }

      const socialNav = document.querySelector<HTMLElement>("[data-social-links]");
      const obstacles = document.querySelectorAll<HTMLElement>("[data-social-obstacle]");
      if (!socialNav || obstacles.length === 0) {
        setIsOverlapping(false);
        return;
      }

      const socialRect = socialNav.getBoundingClientRect();
      const overlaps = Array.from(obstacles).some((obstacle) => {
        const obstacleRect = obstacle.getBoundingClientRect();
        return socialRect.left < obstacleRect.right
          && socialRect.right > obstacleRect.left
          && socialRect.top < obstacleRect.bottom
          && socialRect.bottom > obstacleRect.top;
      });

      setIsOverlapping((current) => current === overlaps ? current : overlaps);
    }

    function scheduleMeasurement() {
      if (frame === undefined) frame = window.requestAnimationFrame(measureOverlap);
    }

    const resizeObserver = new ResizeObserver(scheduleMeasurement);
    resizeObserver.observe(document.documentElement);
    document.querySelectorAll<HTMLElement>("[data-social-obstacle]").forEach((obstacle) => resizeObserver.observe(obstacle));
    window.addEventListener("scroll", scheduleMeasurement, { passive: true, capture: true });
    window.addEventListener("resize", scheduleMeasurement);
    mediaQuery.addEventListener("change", scheduleMeasurement);
    scheduleMeasurement();

    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleMeasurement, true);
      window.removeEventListener("resize", scheduleMeasurement);
      mediaQuery.removeEventListener("change", scheduleMeasurement);
    };
  }, [pathname]);

  return (
    <nav
      data-social-links="true"
      className="mt-12 p-4 md:fixed md:bottom-16 md:right-12"
    >
      <div className={isOverlapping ? "rounded-lg border border-gray-200/70 bg-white/65 p-1.5 backdrop-blur-[1px] transition-[background-color,backdrop-filter,border-color] duration-200" : ""}>
        <ul className="flex items-center justify-center gap-4 md:flex-col">
          {links.map(({ href, src, alt }, index) => (
            <li key={index} className="list-none">
              <Link href={href} target="_blank" rel="noopener noreferrer">
                <Image
                  src={src}
                  alt={alt}
                  className="h-7 w-7 rounded-md p-1 text-red fill-red transition-colors duration-300 hover:bg-neutral-100"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
