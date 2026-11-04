// Runs before the module entry is requested, so an entry download failure can
// be reported even when startup.js never executes. No UI runtime is required.
(() => {
  const prepare = () => {
    const retry = document.getElementById('startup-retry');
    if (!retry || retry.dataset.retryBound) return;
    retry.dataset.retryBound = 'true';
    retry.href = location.href;
    retry.addEventListener('click', (event) => {
      event.preventDefault();
      location.reload();
    });
  };
  function failed(event) {
    if (event.target?.id !== 'startup-entry') return;
    const show = () => {
      prepare();
      const startup = document.getElementById('app-startup');
      if (!startup) return;
      startup.dataset.state = 'error';
      startup.setAttribute('role', 'alert');
      startup.setAttribute('aria-busy', 'false');
      document.getElementById('startup-message').textContent = '工具箱未能加载，请检查网络后重试。';
      document.documentElement.dataset.startupState = 'error';
    };
    if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', show, { once: true });
    else show();
  }
  window.addEventListener('error', failed, true);
  document.addEventListener('DOMContentLoaded', prepare, { once: true });
  document.addEventListener(
    'arg:startupcomplete',
    () => window.removeEventListener('error', failed, true),
    { once: true },
  );
})();
