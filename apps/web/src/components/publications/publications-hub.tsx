"use client";

import { useState, type ReactNode } from "react";

type PublicationView = "blog" | "updates" | "nerds";

interface PublicationsHubProps {
  latestUpdate: ReactNode;
  blog: ReactNode;
  updates: ReactNode;
  nerds: ReactNode;
}

const tabs: Array<{ id: PublicationView; label: string }> = [
  { id: "blog", label: "Blog" },
  { id: "updates", label: "Novidades" },
  { id: "nerds", label: "Novidades para nerds" },
];

export function PublicationsHub({
  latestUpdate,
  blog,
  updates,
  nerds,
}: PublicationsHubProps) {
  const [activeView, setActiveView] = useState<PublicationView>("blog");
  const content = { blog, updates, nerds }[activeView];

  return (
    <>
      {latestUpdate}
      <nav
        aria-label="Seções de publicações"
        className="mb-8 flex flex-nowrap gap-2 overflow-x-auto border-b border-neutral-200"
      >
        {tabs.map((tab) => {
          const active = activeView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-selected={active}
              role="tab"
              onClick={() => setActiveView(tab.id)}
              className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm ${
                active
                  ? "border-black font-semibold"
                  : "border-transparent text-neutral-600 hover:border-neutral-400 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
      <section role="tabpanel">{content}</section>
    </>
  );
}
