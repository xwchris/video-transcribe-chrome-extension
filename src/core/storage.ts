export const API_KEY_STORAGE_KEY = 'videosaysApiKey';
export const LAST_TASK_STORAGE_KEY = 'videosaysLastTask';

export interface StoredTask {
  taskId: string;
  input: string;
  status: string;
  createdAt: string;
}

export function maskApiKey(value: string): string {
  if (!value) return '';
  if (value.length <= 10) return `${value.slice(0, 3)}********`;
  return `${value.slice(0, 7)}****************${value.slice(-4)}`;
}

export async function getStoredApiKey(): Promise<string> {
  const result = await chrome.storage.local.get(API_KEY_STORAGE_KEY);
  return typeof result[API_KEY_STORAGE_KEY] === 'string' ? result[API_KEY_STORAGE_KEY] : '';
}

export async function setStoredApiKey(apiKey: string): Promise<void> {
  await chrome.storage.local.set({ [API_KEY_STORAGE_KEY]: apiKey.trim() });
}

export async function clearStoredApiKey(): Promise<void> {
  await chrome.storage.local.remove(API_KEY_STORAGE_KEY);
}

export async function getLastTask(): Promise<StoredTask | null> {
  const result = await chrome.storage.local.get(LAST_TASK_STORAGE_KEY);
  const task = result[LAST_TASK_STORAGE_KEY];
  return task && typeof task === 'object' ? task as StoredTask : null;
}

export async function setLastTask(task: StoredTask): Promise<void> {
  await chrome.storage.local.set({ [LAST_TASK_STORAGE_KEY]: task });
}
