import { describe, expect, it } from 'vitest';
import { taskDashboardUrl } from './routes';

describe('routes', () => {
  it('builds task detail dashboard URLs', () => {
    expect(taskDashboardUrl('81338b8a-cf85-48a5-bf79-890cbd6ccf4c')).toBe(
      'https://videosays.com/dashboard/tasks/81338b8a-cf85-48a5-bf79-890cbd6ccf4c',
    );
  });
});
