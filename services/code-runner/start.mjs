import { createServer } from 'node:http';
import { createCodeRunnerService } from './index.mjs';
const service = createCodeRunnerService();
const server = createServer((req, res) => {
  if (new URL(req.url, 'http://localhost').pathname === '/api/code/run')
    void service.handle(req, res);
  else {
    res.writeHead(404);
    res.end();
  }
});
server.listen(
  Number(process.env.CODE_RUNNER_PORT || 3215),
  process.env.CODE_RUNNER_HOST || '127.0.0.1',
);
for (const event of ['SIGINT', 'SIGTERM'])
  process.once(event, () => {
    service.close();
    server.close();
    server.closeIdleConnections();
  });
