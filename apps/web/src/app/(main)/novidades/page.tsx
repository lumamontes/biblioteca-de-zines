import type { Metadata } from "next";
import { getChangelog } from "@/content/changelog";
import { getPublicUpdates } from "@/content/updates";
import { ChangelogSectionView } from "@/components/updates/changelog-section";
import { PublicUpdate } from "@/components/updates/public-update";
import { UpdatesHeader } from "@/components/updates/updates-header";

export const metadata: Metadata = {
  title: "Novidades | Biblioteca de Zines",
  description:
    "Acompanhe as novidades publicadas no site da Biblioteca de Zines.",
};

export default async function UpdatesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const technical = (await searchParams).view === "nerds";
  const changelog = technical ? getChangelog() : [];
  const updates = technical ? [] : getPublicUpdates();

  return (
    <main className="min-h-screen bg-white px-4 py-8 md:py-12">
      <div className="mx-auto max-w-screen-md">
        <UpdatesHeader technical={technical} />
        {technical
          ? changelog.map((section) => (
              <ChangelogSectionView key={section.title} section={section} />
            ))
          : updates.map((update) => (
              <PublicUpdate key={update.slug} update={update} />
            ))}
      </div>
    </main>
  );
}
