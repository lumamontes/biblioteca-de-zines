"use client";

import { useState } from "react";
import { novidadesLabModes } from "./novidades-config";

export function NovidadesLab() {
  const [activeMode, setActiveMode] = useState<(typeof novidadesLabModes)[number]["id"]>("discover");
  const mode = novidadesLabModes.find((item) => item.id === activeMode) ?? novidadesLabModes[0];

  return (
    <div className="overflow-hidden border-2 border-black bg-[#f5f2e9] shadow-[8px_8px_0_#d7ff3f]">
      <div className="flex items-center justify-between border-b-2 border-black bg-black px-4 py-3 text-[#f5f2e9]">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em]">janela de teste</span>
        <span className="flex items-center gap-2 font-mono text-[11px] text-[#d7ff3f]">
          <span className="size-2 rounded-full bg-[#d7ff3f]" />
          ao vivo
        </span>
      </div>
      <div className="grid gap-6 p-5 sm:p-7">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Áreas da Biblioteca">
          {novidadesLabModes.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === activeMode}
              onClick={() => setActiveMode(item.id)}
              className={`border border-black px-3 py-2 text-left text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${item.id === activeMode ? "bg-[#d7ff3f]" : "bg-transparent hover:bg-white"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-[1.1fr_0.9fr] sm:items-end">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.16em] text-neutral-500">{mode.eyebrow}</p>
            <h3 className="max-w-md text-2xl font-bold leading-tight sm:text-3xl">{mode.title}</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-700">{mode.body}</p>
          </div>
          <div className="grid grid-cols-3 gap-2" aria-label={`${mode.eyebrow}: ${mode.items.join(", ")}`}>
            {mode.items.map((item, index) => (
              <div key={item} className={`flex aspect-[4/5] items-end border border-black p-2 text-xs font-semibold ${index === 1 ? "bg-[#ff6b4a]" : index === 2 ? "bg-[#b8a7ff]" : "bg-white"}`}>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
