const { app, BrowserWindow, dialog, Menu, session, shell } = require('electron');
const { join } = require('node:path');
const { ORIGIN, createAssetHandler, isAppUrl } = require('./assets.cjs');
const { createServiceHandler } = require('./services.cjs');
const { HOST, setBrowserProxy, startLocalSite } = require('./local-site.cjs');

const TITLE = '迷雾工具箱 · Windows 测试版';
const resources = app.isPackaged ? process.resourcesPath : join(__dirname, '..');
const assets = join(resources, app.isPackaged ? 'site' : 'public');

app.enableSandbox();
app.commandLine.appendSwitch('disable-background-networking');
app.commandLine.appendSwitch('disable-quic');
app.commandLine.appendSwitch('force-webrtc-ip-handling-policy', 'disable_non_proxied_udp');

async function launch() {
  const local = await startLocalSite();
  app.once('before-quit', () => local.close());
  app.commandLine.appendSwitch('host-resolver-rules', `MAP ${HOST} 127.0.0.1:${local.port}`);
  await app.whenReady();
  const toolbox = session.fromPartition('persist:mist-toolbox');
  const services = session.fromPartition('mist-toolbox-services', { cache: false });
  const assetHandler = await createAssetHandler(
    assets,
    createServiceHandler((url, init) => services.fetch(url, init)),
  );
  local.bind(toolbox, assetHandler);
  // Open the local UI even if a system proxy auto-configuration is slow or offline.
  await toolbox.setProxy({ mode: 'direct' });
  const refreshProxy = () => setBrowserProxy(toolbox, services).catch(() => {});
  void refreshProxy();
  toolbox.webRequest.onBeforeRequest({ urls: ['file://*/*', 'ftp://*/*'] }, (_request, done) =>
    done({ cancel: true }),
  );
  const localMainFrame = (contents, url, mainFrame) =>
    mainFrame && isAppUrl(url) && isAppUrl(contents?.getURL());
  toolbox.setPermissionCheckHandler(
    (contents, permission, origin, details) =>
      localMainFrame(contents, origin, details.isMainFrame) &&
      (permission === 'clipboard-sanitized-write' ||
        (permission === 'media' && details.mediaType === 'audio')),
  );
  toolbox.setPermissionRequestHandler((contents, permission, done, details) => {
    done(
      localMainFrame(contents, details.requestingUrl, details.isMainFrame) &&
        (permission === 'clipboard-sanitized-write' ||
          (permission === 'media' &&
            details.mediaTypes?.length === 1 &&
            details.mediaTypes[0] === 'audio')),
    );
  });
  Menu.setApplicationMenu(null);
  const window = new BrowserWindow({
    title: TITLE,
    width: 1400,
    height: 920,
    minWidth: 760,
    minHeight: 560,
    backgroundColor: '#0a0e17',
    autoHideMenuBar: true,
    icon: join(assets, 'branding/20261028-toolbox/favicon.ico'),
    webPreferences: {
      session: toolbox,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: false,
      spellcheck: false,
    },
  });
  window.on('focus', refreshProxy);
  const openExternalLink = (target) => {
    const url = URL.parse(target);
    if (!url || !['http:', 'https:'].includes(url.protocol) || url.username || url.password) return;
    if (!isAppUrl(url.href)) void shell.openExternal(url.href).catch(() => {});
  };
  window.webContents.on('page-title-updated', (event) => event.preventDefault());
  window.webContents.on('will-navigate', (event, url) => {
    if (isAppUrl(url)) return;
    event.preventDefault();
    openExternalLink(url);
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    openExternalLink(url);
    return { action: 'deny' };
  });
  await window.loadURL(ORIGIN + '/');
}

app.setAppUserModelId('cn.mistarg.toolbox.offline');
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const window = BrowserWindow.getAllWindows()[0];
    if (!window) return;
    if (window.isMinimized()) window.restore();
    window.focus();
  });
  launch().catch((error) => {
    dialog.showErrorBox(TITLE, error.message);
    app.exit(1);
  });
  app.on('window-all-closed', () => app.quit());
}
