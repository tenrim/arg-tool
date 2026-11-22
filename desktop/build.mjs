import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'electron-builder';
import { APP_VERSION } from '../public/site-version.js';

if (process.platform !== 'win32') throw Error('请在 Windows 上构建此安装包。');

const root = new URL('../', import.meta.url);
const output = new URL('../outputs/windows-offline/', import.meta.url);
await mkdir(output, { recursive: true });

const localPath = (path) => fileURLToPath(new URL(path, import.meta.url));
process.env.ELECTRON_BUILDER_CACHE ??= localPath('../outputs/electron-builder-cache');
process.env.electron_config_cache ??= localPath('../outputs/electron-runtime-cache');
function run(args, env = process.env) {
  const result = spawnSync(process.execPath, args, { cwd: root, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
run(['desktop/node_modules/electron/install.js'], { ...process.env, ELECTRON_INSTALL_ARCH: 'x64' });
run(['scripts/build.mjs']);

const version = APP_VERSION.slice(1) + '-offline.3';
const installerName = 'Mist-Toolbox-' + version + '-win-x64-setup.exe';
await build({
  win: ['nsis'],
  x64: true,
  publish: 'never',
  projectDir: import.meta.dirname,
  config: {
    appId: 'cn.mistarg.toolbox.offline',
    productName: '迷雾工具箱',
    npmRebuild: false,
    extraMetadata: { version },
    directories: { output: fileURLToPath(output) },
    electronDist: localPath('./node_modules/electron/dist'),
    files: ['main.cjs', 'assets.cjs', 'services.cjs', 'local-site.cjs', 'package.json'],
    extraResources: [
      { from: localPath('../dist'), to: 'site' },
      { from: localPath('../LICENSE'), to: 'LICENSE.toolbox.txt' },
      { from: localPath('../THIRD_PARTY.md'), to: 'THIRD_PARTY.md' },
      { from: localPath('../upstream-manifest.json'), to: 'upstream-manifest.json' },
    ],
    win: {
      icon: localPath('../public/branding/20261028-toolbox/favicon.ico'),
      executableName: 'MistToolboxOffline',
      signExecutable: false,
    },
    nsis: {
      artifactName: installerName,
      oneClick: true,
      perMachine: false,
      installerLanguages: ['zh_CN'],
      shortcutName: '迷雾工具箱（离线测试版）',
      uninstallDisplayName: '迷雾工具箱（离线测试版）',
      runAfterFinish: false,
      deleteAppDataOnUninstall: false,
    },
  },
});
const checksum = createHash('sha256');
for await (const chunk of createReadStream(new URL(installerName, output))) checksum.update(chunk);
await writeFile(
  new URL(installerName + '.sha256', output),
  checksum.digest('hex') + '  ' + installerName + '\n',
);
console.log('安装包：' + fileURLToPath(new URL(installerName, output)));
