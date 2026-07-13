import { describe, expect, it } from 'vitest';
import { createSrt, safeExportFilename } from './export';

describe('export helpers', () => {
  it('creates SRT content from transcript segments', () => {
    expect(createSrt([
      { start: 1.234, end: 3.5, text: 'First line' },
      { start: 65, end: 67.25, text: 'Second line' },
    ])).toBe([
      '1',
      '00:00:01,234 --> 00:00:03,500',
      'First line',
      '',
      '2',
      '00:01:05,000 --> 00:01:07,250',
      'Second line',
    ].join('\n'));
  });

  it('builds filesystem-safe export filenames', () => {
    expect(safeExportFilename('https://www.youtube.com/watch?v=abc:123')).toBe('www.youtube.com-watch-v=abc-123');
    expect(safeExportFilename('')).toBe('transcript');
  });
});
