import { VideosaysApiError, createVideosaysClient, isTerminalStatus, shouldAutoRefreshTask, type TaskStatusResponse } from '../core/api';
import { applyI18n, t } from '../core/i18n';
import { detectPlatformFromInput, extractFirstSupportedLink, type SupportedPlatform } from '../core/links';
import { getLastTask, getStoredApiKey, maskApiKey, setLastTask, setStoredApiKey } from '../core/storage';
import '../shared/styles.css';

const setup = document.querySelector<HTMLElement>('#setup')!;
const app = document.querySelector<HTMLElement>('#app')!;
const taskPanel = document.querySelector<HTMLElement>('#task')!;
const errorPanel = document.querySelector<HTMLElement>('#error-panel')!;
const errorList = document.querySelector<HTMLElement>('#error-list')!;
const apiKeyInput = document.querySelector<HTMLInputElement>('#api-key')!;
const saveKeyButton = document.querySelector<HTMLButtonElement>('#save-key')!;
const detectedUrl = document.querySelector<HTMLElement>('#detected-url')!;
const detectedPlatformIcon = document.querySelector<HTMLElement>('#detected-platform-icon')!;
const videoInput = document.querySelector<HTMLInputElement>('#video-input')!;
const submitButton = document.querySelector<HTMLButtonElement>('#submit')!;
const settingsButton = document.querySelector<HTMLButtonElement>('#settings')!;
const keyState = document.querySelector<HTMLElement>('#key-state')!;
const message = document.querySelector<HTMLElement>('#message')!;
const taskStatus = document.querySelector<HTMLElement>('#task-status')!;
const taskTitle = document.querySelector<HTMLElement>('#task-title')!;
const taskUrl = document.querySelector<HTMLElement>('#task-url')!;
const taskPlatformIcon = document.querySelector<HTMLElement>('#task-platform-icon')!;
const taskIdElement = document.querySelector<HTMLElement>('#task-id')!;
const copyTaskIdButton = document.querySelector<HTMLButtonElement>('#copy-task-id')!;
const completedAt = document.querySelector<HTMLElement>('#completed-at')!;
const progressRow = document.querySelector<HTMLElement>('#progress-row')!;
const progressLabel = document.querySelector<HTMLElement>('#progress-label')!;
const progressValue = document.querySelector<HTMLElement>('#progress-value')!;
const progressFill = document.querySelector<HTMLElement>('#progress-fill')!;
const transcript = document.querySelector<HTMLElement>('#transcript')!;
const openTask = document.querySelector<HTMLAnchorElement>('#open-task')!;
const refreshButton = document.querySelector<HTMLButtonElement>('#refresh')!;
const copyPreviewButton = document.querySelector<HTMLButtonElement>('#copy-preview')!;
const taskNote = document.querySelector<HTMLElement>('#task-note')!;

let apiKey = '';
let currentTaskId = '';
let currentTranscript = '';
let refreshTimer: number | null = null;

const AUTO_REFRESH_INTERVAL_MS = 5000;
const STATUS_MESSAGE_KEYS: Record<string, string> = {
  pending: 'statusPending',
  processing: 'statusProcessing',
  completed: 'statusCompleted',
  failed: 'statusFailed',
};

const PLATFORM_ICON_CONFIG: Record<SupportedPlatform | 'default', { label: string; className: string }> = {
  douyin: { label: '♪', className: 'platform-douyin' },
  tiktok: { label: '♪', className: 'platform-tiktok' },
  youtube: { label: '▶', className: 'platform-youtube' },
  bilibili: { label: 'b', className: 'platform-bilibili' },
  xiaohongshu: { label: 'RED', className: 'platform-xiaohongshu' },
  kuaishou: { label: 'K', className: 'platform-kuaishou' },
  instagram: { label: '◎', className: 'platform-instagram' },
  twitter: { label: '𝕏', className: 'platform-twitter' },
  default: { label: '▶', className: 'platform-default' },
};

function show(element: HTMLElement, visible: boolean): void {
  element.classList.toggle('hidden', !visible);
}

function setMessage(value: string, kind: 'default' | 'error' = 'default'): void {
  message.textContent = value;
  message.classList.toggle('error', kind === 'error');
}

function setPrimaryScreen(screen: 'setup' | 'app' | 'task' | 'error'): void {
  show(setup, screen === 'setup');
  show(app, screen === 'app');
  show(taskPanel, screen === 'task');
  show(errorPanel, screen === 'error');
}

function stopAutoRefresh(): void {
  if (refreshTimer === null) return;
  window.clearInterval(refreshTimer);
  refreshTimer = null;
}

function startAutoRefresh(): void {
  stopAutoRefresh();
  refreshTimer = window.setInterval(() => {
    void refreshTask().catch((error) => {
      stopAutoRefresh();
      showError(error);
    });
  }, AUTO_REFRESH_INTERVAL_MS);
}

async function getActiveTabUrl(): Promise<string> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url ?? '';
}

function formatStatus(status: string): string {
  const key = STATUS_MESSAGE_KEYS[status];
  return key ? t(key) : `${status.slice(0, 1).toUpperCase()}${status.slice(1)}`;
}

function shortTaskId(taskId: string): string {
  return taskId.length > 14 ? `${taskId.slice(0, 10)}...` : taskId;
}

function taskDashboardUrl(taskId: string): string {
  return `https://videosays.com/dashboard?task=${encodeURIComponent(taskId)}`;
}

function setPlatformIcon(element: HTMLElement, platform?: string | null): void {
  const config = PLATFORM_ICON_CONFIG[(platform ?? '') as SupportedPlatform] ?? PLATFORM_ICON_CONFIG.default;
  element.textContent = config.label;
  element.className = `platform-icon ${element.classList.contains('small') ? 'small ' : ''}${config.className}`;
}

function setProgress(status: string): void {
  const isPending = status === 'pending';
  const percent = isPending ? 18 : 42;
  progressLabel.textContent = isPending ? t('waitingInQueue') : t('transcribingAudio');
  progressValue.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
}

function renderTask(task: TaskStatusResponse): void {
  const taskId = task.taskId ?? task.id ?? currentTaskId;
  currentTaskId = taskId;
  const status = task.status;
  const input = task.input ?? videoInput.value;
  const platform = task.video?.platform ?? detectPlatformFromInput(input);
  const title = task.video?.title ?? t('transcriptionTask');
  const text = task.result?.text?.trim() ?? '';

  taskStatus.textContent = formatStatus(status);
  taskStatus.className = `badge ${status}`;
  taskTitle.textContent = title;
  taskUrl.textContent = input;
  setPlatformIcon(taskPlatformIcon, platform);
  taskIdElement.textContent = shortTaskId(taskId);
  taskIdElement.title = taskId;
  openTask.href = taskDashboardUrl(taskId);
  openTask.textContent = status === 'completed' ? t('fullTranscript') : t('dashboard');

  currentTranscript = text;
  transcript.textContent = text ? text.slice(0, 1200) : '';
  show(transcript, Boolean(text));
  show(copyPreviewButton, Boolean(text));
  show(completedAt, status === 'completed');
  completedAt.textContent = status === 'completed' ? t('completedOn', new Date().toLocaleString()) : '';
  show(progressRow, shouldAutoRefreshTask(status));
  show(refreshButton, shouldAutoRefreshTask(status));
  taskNote.textContent = shouldAutoRefreshTask(status)
    ? t('statusRefreshes')
    : t('fullTranscriptNote');
  setProgress(status);
  setPrimaryScreen('task');

  if (shouldAutoRefreshTask(status)) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
}

function errorActions(error: unknown): Array<{ icon: string; title: string; body: string; action: string; href?: string; onClick?: () => void }> {
  if (error instanceof VideosaysApiError && error.statusCode === 401) {
    return [{ icon: '⚿', title: t('apiKeyInvalid'), body: t('apiKeyInvalidBody'), action: t('updateApiKey'), onClick: () => setPrimaryScreen('setup') }];
  }
  if (error instanceof VideosaysApiError && error.statusCode === 402) {
    return [{ icon: '▦', title: t('insufficientCredits'), body: t('insufficientCreditsBody'), action: t('addCredits'), href: 'https://videosays.com/dashboard/billing' }];
  }
  return [{ icon: '↛', title: t('unsupportedLink'), body: error instanceof Error ? error.message : t('unsupportedLinkBody'), action: t('pasteSupportedLink'), onClick: () => setPrimaryScreen(apiKey ? 'app' : 'setup') }];
}

function showError(error: unknown): void {
  stopAutoRefresh();
  const actions = errorActions(error);
  errorList.replaceChildren(...actions.map((item) => {
    const card = document.createElement('div');
    card.className = 'error-card';
    const icon = document.createElement('span');
    icon.className = 'error-icon';
    icon.textContent = item.icon;
    const text = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = item.title;
    const body = document.createElement('p');
    body.textContent = item.body;
    text.append(title, body);
    const action = document.createElement(item.href ? 'a' : 'button');
    action.className = 'error-action';
    action.textContent = item.action;
    if (item.href && action instanceof HTMLAnchorElement) {
      action.href = item.href;
      action.target = '_blank';
      action.rel = 'noreferrer';
    }
    if (item.onClick && action instanceof HTMLButtonElement) action.addEventListener('click', item.onClick);
    card.append(icon, text, action);
    return card;
  }));
  setMessage('');
  setPrimaryScreen('error');
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
  const link = extractFirstSupportedLink(videoInput.value || (detectedUrl.textContent ?? ''));
  if (!link) {
    showError(new Error(t('unsupportedLinkBody')));
    return;
  }

  submitButton.disabled = true;
  setMessage(t('submittingTask'));
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
    setMessage(isTerminalStatus(response.status) ? t('taskCompleted') : t('taskCreated'));
  } catch (error) {
    showError(error);
  } finally {
    submitButton.disabled = false;
  }
}

async function init(): Promise<void> {
  apiKey = await getStoredApiKey();
  keyState.replaceChildren();
  if (apiKey) {
    const check = document.createElement('span');
    check.setAttribute('aria-hidden', 'true');
    check.textContent = '✓';
    keyState.append(check, ` ${t('usingApiKey', maskApiKey(apiKey))}`);
  }

  const activeUrl = await getActiveTabUrl();
  const supported = extractFirstSupportedLink(activeUrl);
  const platform = supported ? detectPlatformFromInput(supported) : null;
  detectedUrl.textContent = supported ?? t('noSupportedVideoLink');
  setPlatformIcon(detectedPlatformIcon, platform);
  videoInput.value = supported ?? '';

  const lastTask = await getLastTask();
  if (!apiKey) {
    setPrimaryScreen('setup');
  } else if (lastTask && shouldAutoRefreshTask(lastTask.status)) {
    currentTaskId = lastTask.taskId;
    renderTask({ id: lastTask.taskId, status: lastTask.status, input: lastTask.input });
  } else {
    setPrimaryScreen('app');
  }
}

saveKeyButton.addEventListener('click', async () => {
  await setStoredApiKey(apiKeyInput.value);
  apiKey = await getStoredApiKey();
  setMessage(apiKey ? t('apiKeySaved') : t('enterApiKey'), apiKey ? 'default' : 'error');
  await init();
});

settingsButton.addEventListener('click', () => void chrome.runtime.openOptionsPage());
submitButton.addEventListener('click', () => void submit());
refreshButton.addEventListener('click', () => void refreshTask().catch(showError));
copyTaskIdButton.addEventListener('click', () => {
  if (currentTaskId) void navigator.clipboard.writeText(currentTaskId);
});
copyPreviewButton.addEventListener('click', () => {
  if (currentTranscript) void navigator.clipboard.writeText(currentTranscript);
});
window.addEventListener('beforeunload', stopAutoRefresh);

applyI18n();
void init();
