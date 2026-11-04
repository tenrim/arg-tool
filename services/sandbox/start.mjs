// Production-only composition. The original services own validation, limits,
// cancellation and execution; this gateway owns only HTTP routing and shutdown.
import { createServer } from 'node:http';
import { createForensicsService } from '../forensics/index.mjs';
import { createCodeRunnerService } from '../code-runner/index.mjs';

const forensics = createForensicsService();
const code = createCodeRunnerService();
const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  const service =
    path === '/api/forensics/run' ? forensics : path === '/api/code/run' ? code : null;
  if (service) void service.handle(req, res);
  else {
    res.writeHead(404, { 'Cache-Control': 'no-store' });
    res.end();
  }
});
server.requestTimeout = 300000;
server.listen(Number(process.env.SANDBOX_PORT || 3215), '127.0.0.1');
for (const event of ['SIGINT', 'SIGTERM']) {
  process.once(event, () => {
    forensics.close();
    code.close();
    server.close();
    server.closeIdleConnections();
  });
}
