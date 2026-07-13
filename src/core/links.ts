const SUPPORTED_HOST_PARTS = [
  'youtube.com',
  'youtu.be',
  'tiktok.com',
  'douyin.com',
  'iesdouyin.com',
  'bilibili.com',
  'b23.tv',
  'xiaohongshu.com',
  'kuaishou.com',
  'instagram.com',
  'x.com',
  'twitter.com',
];

const URL_PATTERN = /https?:\/\/[^\s"'<>]+/gi;

export function normalizeInput(input: string): string {
  return input.trim();
}

export function isSupportedVideoUrl(input: string): boolean {
  try {
    const url = new URL(normalizeInput(input));
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    const hostname = url.hostname.toLowerCase();
    return SUPPORTED_HOST_PARTS.some((hostPart) => hostname === hostPart || hostname.endsWith(`.${hostPart}`));
  } catch {
    return false;
  }
}

export function extractFirstSupportedLink(input: string): string | null {
  const matches = normalizeInput(input).match(URL_PATTERN) ?? [];
  for (const match of matches) {
    const cleaned = match.replace(/[),.;!?]+$/g, '');
    if (isSupportedVideoUrl(cleaned)) return cleaned;
  }
  const normalized = normalizeInput(input);
  return isSupportedVideoUrl(normalized) ? normalized : null;
}
