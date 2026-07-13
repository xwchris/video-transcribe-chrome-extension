import { describe, expect, it } from 'vitest';
import { maskApiKey } from './storage';

describe('storage helpers', () => {
  it('masks long API keys without exposing the middle', () => {
    expect(maskApiKey('dy_1234567890abcdef')).toBe('dy_1234****************cdef');
  });

  it('masks short values defensively', () => {
    expect(maskApiKey('abc')).toBe('abc********');
  });
});
