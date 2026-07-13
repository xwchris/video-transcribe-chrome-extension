import { createVideosaysClient } from '../core/api';
import { t } from '../core/i18n';
import { extractFirstSupportedLink } from '../core/links';
import { taskDashboardUrl } from '../core/routes';
import { getStoredApiKey, setLastTask } from '../core/storage';

const CONTEXT_MENU_ID = 'videosays-transcribe';

async function submitFromInput(input: string): Promise<void> {
  const link = extractFirstSupportedLink(input);
  if (!link) {
    console.warn('videosays_no_supported_link_found');
    return;
  }

  const apiKey = await getStoredApiKey();
  if (!apiKey) {
    await chrome.runtime.openOptionsPage();
    return;
  }

  const client = createVideosaysClient({ apiKey });
  const response = await client.submitTranscription(link);
  const taskId = response.taskId ?? response.id;
  if (!taskId) throw new Error('Videosays did not return a task ID.');

  await setLastTask({
    taskId,
    input: link,
    status: response.status,
    createdAt: new Date().toISOString(),
  });

  await chrome.tabs.create({ url: taskDashboardUrl(taskId) });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: t('actionTitle'),
    contexts: ['page', 'selection', 'link', 'video'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) return;
  const input = info.selectionText ?? info.linkUrl ?? info.srcUrl ?? tab?.url ?? '';
  void submitFromInput(input).catch((error) => {
    console.error('videosays_context_submit_failed', error);
    void chrome.runtime.openOptionsPage();
  });
});
