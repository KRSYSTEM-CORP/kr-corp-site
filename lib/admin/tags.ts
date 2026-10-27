export function parseTags(raw: string): string[] {
  return [...new Set(raw.split(/[,;]/).map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 20);
}
