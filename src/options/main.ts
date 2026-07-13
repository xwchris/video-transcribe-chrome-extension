import { applyI18n, t } from '../core/i18n';
import { clearStoredApiKey, getStoredApiKey, maskApiKey, setStoredApiKey } from '../core/storage';
import '../shared/styles.css';

const input = document.querySelector<HTMLInputElement>('#api-key')!;
const button = document.querySelector<HTMLButtonElement>('#save-key')!;
const clearButton = document.querySelector<HTMLButtonElement>('#clear-key')!;
const message = document.querySelector<HTMLElement>('#message')!;

async function init(): Promise<void> {
  const key = await getStoredApiKey();
  message.textContent = key ? t('currentKey', maskApiKey(key)) : t('noApiKeySaved');
}

button.addEventListener('click', async () => {
  await setStoredApiKey(input.value);
  const key = await getStoredApiKey();
  message.textContent = key ? t('savedKey', maskApiKey(key)) : t('enterApiKey');
});

clearButton.addEventListener('click', async () => {
  await clearStoredApiKey();
  input.value = '';
  message.textContent = t('apiKeyCleared');
});

applyI18n();
void init();
