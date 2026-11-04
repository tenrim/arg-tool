import { createDevServer, closeDevServer } from './server.mjs';

// Each test owns a fresh loopback server, without SMTP, online queries or a
// dependency on a developer's existing port. Browser contexts remain isolated.
export async function startBrowserTestSite({ env = {} } = {}) {
  const server = createDevServer({
    env,
    feedbackStarter: async () => ({ state: 'unconfigured', close: async () => {} }),
    onlineQueryFactory: () => ({ handle: () => false, close() {} }),
  });
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
  } catch (error) {
    await closeDevServer(server);
    throw error;
  }
  return {
    base: `http://127.0.0.1:${server.address().port}`,
    close: () => closeDevServer(server),
  };
}
