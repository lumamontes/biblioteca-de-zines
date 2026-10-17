import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import path from "node:path";

const changelogPath = path.resolve(import.meta.dirname, "../../../CHANGELOG.md");
const changelog = readFileSync(changelogPath, "utf8");
const lines = changelog.split("\n");

function entriesFromMarkdown() {
  const entries = [];

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^- \*\*(.+?)\*\*:\s*(.*)$/);
    if (!match) continue;

    const content = [match[2]];
    let nextIndex = index + 1;
    while (nextIndex < lines.length && lines[nextIndex].startsWith("  ")) {
      content.push(lines[nextIndex].trim());
      nextIndex += 1;
    }

    entries.push({ title: match[1], text: content.join(" ") });
    index = nextIndex - 1;
  }

  return entries;
}

test("changelog entries explain a meaningful change", () => {
  const entries = entriesFromMarkdown();
  assert.ok(entries.length > 0, "CHANGELOG.md must contain entries");

  for (const entry of entries) {
    const links = [...entry.text.matchAll(/\[[^\]]+\]\([^)]+\)/g)];
    const summary = entry.text.replace(/\[[^\]]+\]\([^)]+\)/g, "").trim();

    assert.ok(entry.title.length >= 8, `Title is too vague: ${entry.title}`);
    assert.ok(
      summary.length >= 120,
      `Summary must explain impact and behavior, not list terms: ${entry.title}`,
    );
    assert.ok(
      /[.!?]$/.test(summary),
      `Summary must be a complete sentence: ${entry.title}`,
    );
    assert.ok(links.length > 0, `Entry needs a source reference: ${entry.title}`);
    assert.doesNotMatch(
      summary,
      /^(?:contrato|integração|suporte|correção|melhorias?)\s*:/i,
      `Summary must not be a label followed by a word list: ${entry.title}`,
    );
  }
});

test("dated changelog sections use ISO dates in reverse chronological order", () => {
  const dates = lines
    .filter((line) => line.startsWith("## "))
    .map((line) => line.slice(3))
    .filter((title) => /^\d{4}-\d{2}-\d{2}$/.test(title));

  assert.deepEqual(
    dates,
    [...dates].sort((a, b) => b.localeCompare(a)),
    "Release sections must list the latest date first",
  );
});
