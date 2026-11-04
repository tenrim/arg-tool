// Dependency-light entry: its initial status is already in the HTML, before
// React/Animate UI and the application graph can arrive. Tool UI stays in app.js.
const startup = document.getElementById('app-startup');
const message = document.getElementById('startup-message');
const retry = document.getElementById('startup-retry');
retry.href = location.href;

try {
  // The small preferences module applies the real stored motion setting while
  // the heavy app graph loads; no duplicate storage parser or preference keys.
  const application = import('./app.js');
  const preferences = import('./preferences.js').then((module) => {
    module.initPreferences();
    startup.dataset.animate = 'true';
  });
  const [app] = await Promise.all([application, preferences]);
  await app.startupReady;
  const { prepareInitialPresence, animatePresence } = await import('./ui/index.js');
  await prepareInitialPresence();
  // A ready document must have its selected real workspace, not just an empty
  // shell or a settled import. Do not wait for unrelated tools or remote services.
  for (const node of document.querySelectorAll('[data-startup-inert]')) {
    node.inert = false;
    delete node.dataset.startupInert;
  }
  startup.remove();
  const panel = document.querySelector('.panel:not([hidden])');
  if (panel) animatePresence(panel);
  document.documentElement.dataset.startupState = 'ready';
  performance.mark('arg:startup-ready');
} catch {
  startup.dataset.state = 'error';
  startup.setAttribute('aria-busy', 'false');
  startup.setAttribute('role', 'alert');
  message.textContent = '工具箱未能加载，请检查网络后重试。';
  retry.hidden = false;
  document.documentElement.dataset.startupState = 'error';
}
document.dispatchEvent(new Event('arg:startupcomplete'));
