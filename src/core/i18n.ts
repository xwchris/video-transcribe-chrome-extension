export function t(key: string, substitutions?: string | string[]): string {
  const message = chrome.i18n?.getMessage(key, substitutions);
  return message || key;
}

export function applyI18n(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n ?? '');
  });
  root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-i18n-placeholder]').forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder ?? '');
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((element) => {
    element.title = t(element.dataset.i18nTitle ?? '');
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-aria-label]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel ?? ''));
  });
}
