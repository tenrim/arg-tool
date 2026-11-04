import { onDisconnect } from './core.js';

export function bindRunShortcut(root, button) {
  const keydown = (event) => {
    if (
      event.defaultPrevented ||
      event.isComposing ||
      event.keyCode === 229 ||
      event.repeat ||
      event.altKey ||
      event.shiftKey ||
      event.key !== 'Enter' ||
      !(event.ctrlKey || event.metaKey) ||
      document.documentElement.dataset.uiRunShortcut === 'false'
    )
      return;
    if (document.querySelector('dialog[open]') && !root.closest('dialog[open]')) return;
    if (
      !button?.isConnected ||
      button.disabled ||
      !button.getClientRects().length ||
      button.closest('[hidden],[inert]')
    )
      return;
    event.preventDefault();
    button.click();
  };
  root.addEventListener('keydown', keydown);
  onDisconnect(root, () => root.removeEventListener('keydown', keydown));
}
