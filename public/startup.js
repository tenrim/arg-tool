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
  const initialHash = location.hash;
  const [path, query] = initialHash.slice(1).split('?');
  const params = new URLSearchParams(query);
  if ((path === 'analysis' || params.has('task')) && !navigator.connection?.saveData) {
    // Only the selected direct link competes with app startup. Resolve real aliases
    // and variants; a later route change or a failed bootstrap abandons unused work.
    void (async () => {
      let start, stop;
      if (path === 'analysis') {
        const [{ analysisAccess, ANALYSIS_CAPABILITY }, engine] = await Promise.all([
          import('./capabilities/analysis-access.js'),
          import('./cyberchef-client.js'),
        ]);
        if (
          !analysisAccess.unlocked() ||
          (params.has('task') && params.get('task') !== ANALYSIS_CAPABILITY)
        )
          return;
        start = engine.prepareCyberChef;
        stop = engine.cancelCyberChefPreparation;
      } else {
        const [routes, preparation] = await Promise.all([
          import('./capabilities/registry.js'),
          import('./page-preparation.js'),
        ]);
        const registry = await routes.loadRegistry();
        const { entry } = routes.resolveCapability(
          registry,
          params.get('task'),
          params.get('op'),
          params.get('dir'),
          params.get('view'),
        );
        if (!entry || entry.listed === false || entry.route !== path) return;
        // The router may restore a different remembered variant on an ambiguous topic.
        if (
          entry.variants?.length > 1 &&
          entry.id === params.get('task') &&
          !params.has('view') &&
          !params.has('op')
        )
          return;
        start = () => preparation.preparePage(entry.open.panel, entry, path.split('/')[1]);
        stop = preparation.clearPagePreparation;
      }
      if (
        location.hash !== initialHash ||
        !startup.isConnected ||
        startup.dataset.state === 'error'
      )
        return;
      start();
      window.addEventListener('hashchange', stop, { once: true });
      document.addEventListener(
        'arg:startupcomplete',
        () => {
          window.removeEventListener('hashchange', stop);
          if (document.documentElement.dataset.startupState !== 'ready') stop();
        },
        { once: true },
      );
    })().catch(() => {});
  }
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
