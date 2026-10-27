export const KINDS = { cliente: "Cliente", empresa: "Empresa", prospecto: "Prospecto" } as const;
export type Kind = keyof typeof KINDS;

export function parseTags(raw: string): string[] {
  return [...new Set(raw.split(/[,;]/).map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 20);
}

export const kindOf = (tags: string[]): Kind | null => (Object.keys(KINDS) as Kind[]).find((k) => tags.includes(k)) ?? null;

// A contact has at most one "tipo"; everything else in tags is free-form.
export function withKind(tags: string[], kind: Kind | null): string[] {
  const rest = tags.filter((t) => !(t in KINDS));
  return kind ? [kind, ...rest] : rest;
}
