"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);

  return (
    <header className="flex justify-between items-center p-4 ">
      <Link href="/" className="md:block text-lg font-bold">
        Biblioteca de Zines
      </Link>

      <button
        className="md:hidden p-2"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <Image src="/menu.svg" alt="Menu" width={24} height={24} />
      </button>

      <nav className="hidden md:flex gap-4">
        <ul className="flex gap-4">
          <li>
            <Link href="/about" className="hover:underline">
              Sobre
            </Link>
          </li>
          <li>
            <Link
              href="https://forms.gle/ydedperb4c2WbiRW9"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base underline transition duration-300"
            >
              Sugerir Zine
            </Link>
          </li>
        </ul>
      </nav>

      {/* Mobile */}
      {menuOpen && (
        <nav className="absolute top-16 z-10 left-0 w-full bg-white shadow-md flex flex-col items-center gap-4 py-4 md:hidden">
          <ul className="flex flex-col items-center gap-4">
            <li>
              <Link
                href="/about"
                className="hover:underline"
                onClick={toggleMenu}
              >
                Sobre
              </Link>
            </li>
            <li>
              <Link
                href="https://forms.gle/ydedperb4c2WbiRW9"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base underline transition duration-300"
                onClick={toggleMenu}
              >
                Sugerir Zine
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
