import { clearStoredApiKey, getStoredApiKey, maskApiKey, setStoredApiKey } from '../core/storage';
import '../shared/styles.css';

const input = document.querySelector<HTMLInputElement>('#api-key')!;
const button = document.querySelector<HTMLButtonElement>('#save-key')!;
const clearButton = document.querySelector<HTMLButtonElement>('#clear-key')!;
const message = document.querySelector<HTMLElement>('#message')!;

async function init(): Promise<void> {
  const key = await getStoredApiKey();
  message.textContent = key ? `Current key: ${maskApiKey(key)}` : 'No API key saved.';
}

button.addEventListener('click', async () => {
  await setStoredApiKey(input.value);
  const key = await getStoredApiKey();
  message.textContent = key ? `Saved ${maskApiKey(key)}` : 'Enter an API key.';
});

clearButton.addEventListener('click', async () => {
  await clearStoredApiKey();
  input.value = '';
  message.textContent = 'API key cleared. Open the popup to test first-use setup.';
});

void init();
