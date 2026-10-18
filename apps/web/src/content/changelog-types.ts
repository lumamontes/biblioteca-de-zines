export type ChangelogKind =
  | "added"
  | "changed"
  | "deprecated"
  | "removed"
  | "fixed"
  | "security";

export interface ChangelogReference {
  label: string;
  url: string;
}

export interface ChangelogEntry {
  title: string;
  kind: ChangelogKind;
  summary: string;
  references: ChangelogReference[];
}

export interface ChangelogSection {
  title: string;
  releasedAt?: string;
  entries: ChangelogEntry[];
}

export interface ChangelogDocument {
  introduction: string[];
  sections: ChangelogSection[];
}
