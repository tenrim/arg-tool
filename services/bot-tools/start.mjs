import { readConfig } from './config.mjs';
import { startBotTools } from './server.mjs';
try {
  const service = await startBotTools(readConfig());
  console.log('BOT_TOOLS_READY ' + service.base);
  let closing = false;
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, async () => {
      if (closing) return;
      closing = true;
      await service.close();
      process.exit(0);
    });
} catch {
  console.error('BOT_TOOLS_START_FAILED 请检查私密配置、浏览器安装及端口占用。');
  process.exitCode = 1;
}
