import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type {
  ChangelogEntry,
  ChangelogDocument,
  ChangelogKind,
  ChangelogReference,
  ChangelogSection,
} from "./changelog-types";

const kindByHeading: Record<string, ChangelogKind> = {
  Adicionado: "added",
  Adicionados: "added",
  Alterado: "changed",
  Alterados: "changed",
  Descontinuado: "deprecated",
  Descontinuados: "deprecated",
  Removido: "removed",
  Removidos: "removed",
  Corrigido: "fixed",
  Corrigidos: "fixed",
  Segurança: "security",
};

function readChangelog(): string {
  const candidates = [
    path.resolve(process.cwd(), "CHANGELOG.md"),
    path.resolve(process.cwd(), "../../CHANGELOG.md"),
  ];
  const filePath = candidates.find((candidate) => existsSync(candidate));

  if (!filePath) throw new Error("CHANGELOG.md was not found");
  return readFileSync(filePath, "utf8");
}

function parseReferences(text: string): {
  summary: string;
  references: ChangelogReference[];
} {
  const references: ChangelogReference[] = [];
  const summary = text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, url: string) => {
      references.push({ label, url });
      return "";
    })
    .replace(/\s+/g, " ")
    .trim();

  return { summary, references };
}

function parseEntry(lines: string[], index: number): { entry: ChangelogEntry; nextIndex: number } {
  const match = lines[index].match(/^- \*\*(.+?)\*\*:\s*(.*)$/);
  if (!match) throw new Error(`Invalid changelog entry: ${lines[index]}`);

  const content = [match[2]];
  let nextIndex = index + 1;
  while (nextIndex < lines.length && lines[nextIndex].startsWith("  ")) {
    content.push(lines[nextIndex].trim());
    nextIndex += 1;
  }

  const { summary, references } = parseReferences(content.join(" "));
  return {
    entry: {
      title: match[1],
      kind: "changed",
      summary,
      references,
    },
    nextIndex,
  };
}

export function getChangelog(): ChangelogDocument {
  const lines = readChangelog().split("\n");
  const sections: ChangelogSection[] = [];
  const firstSectionIndex = lines.findIndex((line) => line.startsWith("## "));
  const introduction = lines
    .slice(1, firstSectionIndex === -1 ? lines.length : firstSectionIndex)
    .join("\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  let section: ChangelogSection | undefined;
  let kind: ChangelogKind = "changed";

  for (let index = 0; index < lines.length; index += 1) {
    const sectionMatch = lines[index].match(/^## (.+)$/);
    if (sectionMatch) {
      const title = sectionMatch[1];
      section = {
        title,
        releasedAt: /^\d{4}-\d{2}-\d{2}$/.test(title) ? title : undefined,
        entries: [],
      };
      sections.push(section);
      continue;
    }

    const kindMatch = lines[index].match(/^### (.+)$/);
    if (kindMatch) {
      kind = kindByHeading[kindMatch[1]] ?? "changed";
      continue;
    }

    if (section && lines[index].startsWith("- **")) {
      const parsed = parseEntry(lines, index);
      parsed.entry.kind = kind;
      section.entries.push(parsed.entry);
      index = parsed.nextIndex - 1;
    }
  }

  return {
    introduction,
    sections: sections.filter((currentSection) => currentSection.entries.length > 0),
  };
}
