import { describe, expect, it } from 'vitest';
import { areEquivalentSupportedLinks, detectPlatformFromInput, extractFirstSupportedLink, isSupportedVideoUrl, normalizeInput } from './links';

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

  it('detects the same supported platforms as the Videosays product', () => {
    expect(detectPlatformFromInput('https://v.douyin.com/test/')).toBe('douyin');
    expect(detectPlatformFromInput('https://www.tiktok.com/@demo/video/123')).toBe('tiktok');
    expect(detectPlatformFromInput('https://www.xiaohongshu.com/explore/abc')).toBe('xiaohongshu');
    expect(detectPlatformFromInput('https://www.bilibili.com/video/BV123')).toBe('bilibili');
    expect(detectPlatformFromInput('https://youtu.be/abc123')).toBe('youtube');
    expect(detectPlatformFromInput('https://www.kuaishou.com/short-video/abc')).toBe('kuaishou');
    expect(detectPlatformFromInput('https://www.instagram.com/reels/abc/')).toBe('instagram');
    expect(detectPlatformFromInput('https://x.com/user/status/123')).toBe('twitter');
  });

  it('matches the active tab link to the stored task input', () => {
    expect(areEquivalentSupportedLinks(
      'https://www.douyin.com/video/7660105156793684401',
      ' https://www.douyin.com/video/7660105156793684401 ',
    )).toBe(true);
    expect(areEquivalentSupportedLinks(
      'https://www.douyin.com/video/7660105156793684401',
      'https://www.douyin.com/video/another',
    )).toBe(false);
  });
});
