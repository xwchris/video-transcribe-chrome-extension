export type SupportedPlatform = 'douyin' | 'tiktok' | 'xiaohongshu' | 'bilibili' | 'youtube' | 'kuaishou' | 'instagram' | 'twitter';

const PLATFORM_HOSTS: Array<{ platform: SupportedPlatform; hosts: string[] }> = [
  { platform: 'douyin', hosts: ['douyin.com', 'iesdouyin.com'] },
  { platform: 'tiktok', hosts: ['tiktok.com'] },
  { platform: 'xiaohongshu', hosts: ['xiaohongshu.com', 'xhslink.com'] },
  { platform: 'bilibili', hosts: ['bilibili.com', 'b23.tv'] },
  { platform: 'youtube', hosts: ['youtube.com', 'youtu.be'] },
  { platform: 'kuaishou', hosts: ['kuaishou.com', 'gifshow.com'] },
  { platform: 'instagram', hosts: ['instagram.com'] },
  { platform: 'twitter', hosts: ['x.com', 'twitter.com'] },
];

const URL_PATTERN = /https?:\/\/[^\s"'<>]+/gi;

export function normalizeInput(input: string): string {
  return input.trim();
}

export function isSupportedVideoUrl(input: string): boolean {
  return detectPlatformFromInput(input) !== null;
}

export function detectPlatformFromInput(input: string): SupportedPlatform | null {
  const url = normalizeInput(input).match(URL_PATTERN)?.[0] ?? normalizeInput(input);
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    const hostname = parsed.hostname.toLowerCase();
    const match = PLATFORM_HOSTS.find(({ hosts }) => hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`)));
    return match?.platform ?? null;
  } catch {
    return null;
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
