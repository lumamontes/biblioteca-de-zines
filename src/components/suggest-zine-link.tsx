import Link from "next/link";

export default function SuggestZineLink() {
  return (
    <Link
        href={'/zines/apply'}
        className="text-base hover:underline transition duration-300 flex items-center justify-center"
      >
        Sugerir Zine
      </Link>
  )
}
