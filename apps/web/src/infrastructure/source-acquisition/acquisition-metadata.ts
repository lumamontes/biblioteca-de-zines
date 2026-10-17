export function filenameFromContentDisposition(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  return match ? decodeURIComponent(match[1] ?? match[2]) : null;
}

export function parseByteSize(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  return Number(value);
}
