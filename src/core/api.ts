export const API_BASE_URL = 'https://api.videosays.com';
export const CLIENT_NAME = 'videosays-chrome-extension';
export const CLIENT_VERSION = '0.1.0';

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | string;

export interface SubmitTaskResponse {
  taskId?: string;
  id?: string;
  status: TaskStatus;
  input?: string;
}

export interface TaskStatusResponse {
  id?: string;
  taskId?: string;
  status: TaskStatus;
  input?: string;
  video?: {
    platform?: string | null;
    title?: string | null;
    author?: string | null;
  } | null;
  result?: {
    text?: string | null;
    segments?: unknown;
    sourceType?: string | null;
    provider?: string | null;
  } | null;
  error?: {
    code?: string | null;
    message?: string | null;
  } | string | null;
}

export interface CreditBalanceResponse {
  balance: number;
  reservedBalance?: number;
  availableBalance?: number;
  totalPurchased?: number;
  totalUsed?: number;
}

export class VideosaysApiError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'VideosaysApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface VideosaysClientOptions {
  apiKey: string;
  fetchImpl?: typeof fetch;
}

export interface VideosaysClient {
  submitTranscription(input: string): Promise<SubmitTaskResponse>;
  getTaskStatus(taskId: string): Promise<TaskStatusResponse>;
  fetchCredits(): Promise<CreditBalanceResponse>;
}

function requestHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
    'X-Videosays-Client-Name': CLIENT_NAME,
    'X-Videosays-Client-Version': CLIENT_VERSION,
  };
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

async function requestJson<T>(fetchImpl: typeof fetch, apiKey: string, endpoint: string, init?: RequestInit): Promise<T> {
  const response = await fetchImpl(`${API_BASE_URL}${endpoint}`, {
    ...init,
    headers: {
      ...requestHeaders(apiKey),
      ...init?.headers,
    },
  });
  const data = await parseResponse(response);

  if (!response.ok) {
    const body = data && typeof data === 'object' ? data as Record<string, unknown> : {};
    const message = typeof body.error === 'string' ? body.error : `Videosays API request failed (${response.status})`;
    const code = typeof body.code === 'string' ? body.code : undefined;
    throw new VideosaysApiError(message, response.status, code);
  }

  return data as T;
}

export function isTerminalStatus(status: TaskStatus): boolean {
  return status === 'completed' || status === 'failed';
}

export function createVideosaysClient(options: VideosaysClientOptions): VideosaysClient {
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    submitTranscription(input: string) {
      return requestJson<SubmitTaskResponse>(fetchImpl, options.apiKey, '/api/v1/transcribe', {
        method: 'POST',
        body: JSON.stringify({
          input,
          tracking: {
            clientName: CLIENT_NAME,
            clientVersion: CLIENT_VERSION,
            clientSurface: 'api',
            source: 'chrome_extension',
          },
        }),
      });
    },
    getTaskStatus(taskId: string) {
      return requestJson<TaskStatusResponse>(fetchImpl, options.apiKey, `/api/v1/transcribe/${encodeURIComponent(taskId)}`);
    },
    fetchCredits() {
      return requestJson<CreditBalanceResponse>(fetchImpl, options.apiKey, '/api/v1/credits');
    },
  };
}
