import { describe, expect, it, vi } from 'vitest';
import { VideosaysApiError, createVideosaysClient, isTerminalStatus, shouldAutoRefreshTask } from './api';

describe('Videosays API client', () => {
  it('submits a transcription task with API key and extension tracking', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ taskId: 'task_1', status: 'pending' })));
    const client = createVideosaysClient({ apiKey: 'dy_test', fetchImpl: fetchMock });

    const result = await client.submitTranscription('https://www.youtube.com/watch?v=abc');

    expect(result.taskId).toBe('task_1');
    expect(fetchMock).toHaveBeenCalledWith('https://api.videosays.com/api/v1/transcribe', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        'X-API-Key': 'dy_test',
        'X-Videosays-Client-Name': 'videosays-chrome-extension',
      }),
      body: JSON.stringify({
        input: 'https://www.youtube.com/watch?v=abc',
        tracking: {
          clientName: 'videosays-chrome-extension',
          clientVersion: '0.1.0',
          clientSurface: 'api',
          source: 'chrome_extension',
        },
      }),
    }));
  });

  it('normalizes API errors with status and code', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ error: 'No credits', code: 'insufficient_credits' }), { status: 402 }));
    const client = createVideosaysClient({ apiKey: 'dy_test', fetchImpl: fetchMock });

    await expect(client.fetchCredits()).rejects.toMatchObject({
      name: 'VideosaysApiError',
      statusCode: 402,
      code: 'insufficient_credits',
      message: 'No credits',
    });
  });

  it('detects terminal task statuses', () => {
    expect(isTerminalStatus('completed')).toBe(true);
    expect(isTerminalStatus('failed')).toBe(true);
    expect(isTerminalStatus('processing')).toBe(false);
  });

  it('auto refreshes only non-terminal task statuses', () => {
    expect(shouldAutoRefreshTask('pending')).toBe(true);
    expect(shouldAutoRefreshTask('processing')).toBe(true);
    expect(shouldAutoRefreshTask('completed')).toBe(false);
    expect(shouldAutoRefreshTask('failed')).toBe(false);
  });

  it('preserves non-JSON failure bodies', async () => {
    const fetchMock = vi.fn(async () => new Response('Gateway timeout', { status: 504 }));
    const client = createVideosaysClient({ apiKey: 'dy_test', fetchImpl: fetchMock });

    await expect(client.getTaskStatus('task_1')).rejects.toBeInstanceOf(VideosaysApiError);
  });
});
