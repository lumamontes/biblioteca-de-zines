import Link from "next/link";

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <Link href="/">Biblioteca de Zines</Link>
      <nav>
        <ul className="flex gap-4">
          <Link
            href="https://forms.gle/ydedperb4c2WbiRW9"
            target="_blank"
            className="text-base underline transition duration-300 flex items-center justify-center"
          >
            Sugerir Zine
          </Link>
        </ul>
      </nav>
    </header>
  );
}
