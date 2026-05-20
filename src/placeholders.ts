const placeholderPattern = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g;

export function extractPlaceholders(markdown: string): string[] {
  const names = new Set<string>();

  for (const match of markdown.matchAll(placeholderPattern)) {
    const name = match[1];
    if (name) {
      names.add(name);
    }
  }

  return [...names].sort((left, right) => left.localeCompare(right));
}
