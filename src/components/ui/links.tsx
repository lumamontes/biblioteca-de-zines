import Link from "next/link";

export const ZineSuggestion = () => {
  return (
    <Link
      href="/zines/apply"
      target="_blank"
      className="text-base underline transition duration-300 flex items-center justify-center"
    >
      Sugerir Zine
    </Link>
  );
};

