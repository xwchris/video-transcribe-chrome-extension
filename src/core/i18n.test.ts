import { afterEach, describe, expect, it, vi } from 'vitest';
import { t } from './i18n';

describe('i18n helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads localized Chrome messages with substitutions', () => {
    vi.stubGlobal('chrome', {
      i18n: {
        getMessage: (key: string, substitutions?: string | string[]) => {
          const values = Array.isArray(substitutions) ? substitutions : [substitutions];
          return key === 'usingApiKey' ? `Using ${values[0]}` : '';
        },
      },
    });

    expect(t('usingApiKey', 'dy_1234********cdef')).toBe('Using dy_1234********cdef');
  });

  it('falls back to the key when Chrome has no message', () => {
    vi.stubGlobal('chrome', {
      i18n: {
        getMessage: () => '',
      },
    });

    expect(t('missingKey')).toBe('missingKey');
  });
});
