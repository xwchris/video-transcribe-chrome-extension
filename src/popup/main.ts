import { createVideosaysClient, isTerminalStatus, type TaskStatusResponse } from '../core/api';
import { extractFirstSupportedLink } from '../core/links';
import { getLastTask, getStoredApiKey, maskApiKey, setLastTask, setStoredApiKey } from '../core/storage';
import '../shared/styles.css';

const setup = document.querySelector<HTMLElement>('#setup')!;
const app = document.querySelector<HTMLElement>('#app')!;
const taskPanel = document.querySelector<HTMLElement>('#task')!;
const apiKeyInput = document.querySelector<HTMLInputElement>('#api-key')!;
const saveKeyButton = document.querySelector<HTMLButtonElement>('#save-key')!;
const videoInput = document.querySelector<HTMLTextAreaElement>('#video-input')!;
const submitButton = document.querySelector<HTMLButtonElement>('#submit')!;
const keyState = document.querySelector<HTMLElement>('#key-state')!;
const message = document.querySelector<HTMLElement>('#message')!;
const taskStatus = document.querySelector<HTMLElement>('#task-status')!;
const taskTitle = document.querySelector<HTMLElement>('#task-title')!;
const transcript = document.querySelector<HTMLElement>('#transcript')!;
const openTask = document.querySelector<HTMLAnchorElement>('#open-task')!;
const refreshButton = document.querySelector<HTMLButtonElement>('#refresh')!;

let apiKey = '';
let currentTaskId = '';

function show(element: HTMLElement, visible: boolean): void {
  element.classList.toggle('hidden', !visible);
}

function setMessage(value: string, kind: 'default' | 'error' = 'default'): void {
  message.textContent = value;
  message.classList.toggle('error', kind === 'error');
}

async function getActiveTabUrl(): Promise<string> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url ?? '';
}

function renderTask(task: TaskStatusResponse): void {
  const taskId = task.taskId ?? task.id ?? currentTaskId;
  currentTaskId = taskId;
  taskStatus.textContent = task.status;
  taskStatus.className = `badge ${task.status}`;
  taskTitle.textContent = task.video?.title ?? task.input ?? '';
  openTask.href = `https://videosays.com/dashboard?task=${encodeURIComponent(taskId)}`;

  const text = task.result?.text?.trim();
  transcript.textContent = text ? text.slice(0, 1200) : '';
  show(transcript, Boolean(text));
  show(taskPanel, true);
}

async function refreshTask(): Promise<void> {
  if (!apiKey || !currentTaskId) return;
  const client = createVideosaysClient({ apiKey });
  const task = await client.getTaskStatus(currentTaskId);
  renderTask(task);
  await setLastTask({
    taskId: currentTaskId,
    input: task.input ?? videoInput.value,
    status: task.status,
    createdAt: new Date().toISOString(),
  });
}

async function submit(): Promise<void> {
  const link = extractFirstSupportedLink(videoInput.value);
  if (!link) {
    setMessage('Paste or open a supported public video link.', 'error');
    return;
  }

  submitButton.disabled = true;
  setMessage('Submitting task...');
  try {
    const client = createVideosaysClient({ apiKey });
    const response = await client.submitTranscription(link);
    const taskId = response.taskId ?? response.id;
    if (!taskId) throw new Error('Videosays did not return a task ID.');
    currentTaskId = taskId;
    await setLastTask({
      taskId,
      input: link,
      status: response.status,
      createdAt: new Date().toISOString(),
    });
    renderTask({ id: taskId, status: response.status, input: link });
    setMessage(isTerminalStatus(response.status) ? 'Task completed.' : 'Task created. Refresh to check progress.');
  } catch (error) {
    const text = error instanceof Error ? error.message : 'Failed to submit task.';
    setMessage(text, 'error');
  } finally {
    submitButton.disabled = false;
  }
}

async function init(): Promise<void> {
  apiKey = await getStoredApiKey();
  show(setup, !apiKey);
  show(app, Boolean(apiKey));
  keyState.textContent = apiKey ? `Using ${maskApiKey(apiKey)}` : '';

  const activeUrl = await getActiveTabUrl();
  const supported = extractFirstSupportedLink(activeUrl);
  videoInput.value = supported ?? activeUrl;

  const lastTask = await getLastTask();
  if (lastTask) {
    currentTaskId = lastTask.taskId;
    renderTask({ id: lastTask.taskId, status: lastTask.status, input: lastTask.input });
  }
}

saveKeyButton.addEventListener('click', async () => {
  await setStoredApiKey(apiKeyInput.value);
  apiKey = await getStoredApiKey();
  setMessage(apiKey ? 'API key saved.' : 'Enter an API key.', apiKey ? 'default' : 'error');
  await init();
});

submitButton.addEventListener('click', () => void submit());
refreshButton.addEventListener('click', () => void refreshTask().catch((error) => {
  setMessage(error instanceof Error ? error.message : 'Failed to refresh task.', 'error');
}));

void init();
