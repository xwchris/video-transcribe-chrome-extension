import { describe, expect, it } from 'vitest';
import { extractFirstSupportedLink, isSupportedVideoUrl, normalizeInput } from './links';

describe('links', () => {
  it('extracts the first supported URL from selected share text', () => {
    const input = 'Check this https://www.tiktok.com/@creator/video/123456 and save it';

    expect(extractFirstSupportedLink(input)).toBe('https://www.tiktok.com/@creator/video/123456');
  });

  it('normalizes raw input before submission', () => {
    expect(normalizeInput('  https://youtu.be/abc123?si=x  ')).toBe('https://youtu.be/abc123?si=x');
  });

  it('accepts supported public video hosts', () => {
    expect(isSupportedVideoUrl('https://www.youtube.com/watch?v=abc')).toBe(true);
    expect(isSupportedVideoUrl('https://www.bilibili.com/video/BV123')).toBe(true);
    expect(isSupportedVideoUrl('https://v.douyin.com/abc')).toBe(true);
  });

  it('rejects non-video and browser-internal URLs', () => {
    expect(isSupportedVideoUrl('chrome://extensions')).toBe(false);
    expect(isSupportedVideoUrl('https://example.com/post')).toBe(false);
  });
});
