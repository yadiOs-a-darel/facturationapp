export function resolveUploadUrl(
  url: string | null | undefined,
  options?: { absolute?: boolean },
): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads')) {
    if (options?.absolute && typeof window !== 'undefined') {
      return `${window.location.origin}${url}`;
    }
    return url;
  }
  return url;
}
