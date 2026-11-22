const {
  generateKeyPairSync,
  randomBytes,
  timingSafeEqual,
  X509Certificate,
} = require('node:crypto');
const { createServer } = require('node:https');
const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const forge = require('node-forge');
const { ORIGIN } = require('./assets.cjs');

const HOST = new URL(ORIGIN).hostname;
const SESSION_HEADER = 'x-mist-desktop-session';

function ephemeralCertificate() {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  const certificate = forge.pki.createCertificate();
  const identity = [{ shortName: 'CN', value: HOST }];
  certificate.publicKey = forge.pki.publicKeyFromPem(publicKey);
  certificate.serialNumber = '01' + randomBytes(16).toString('hex');
  certificate.validity.notBefore = new Date(Date.now() - 60000);
  certificate.validity.notAfter = new Date(Date.now() + 30 * 86400000);
  certificate.setSubject(identity);
  certificate.setIssuer(identity);
  certificate.setExtensions([
    { name: 'basicConstraints', cA: false },
    { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
    { name: 'extKeyUsage', serverAuth: true },
    { name: 'subjectAltName', altNames: [{ type: 2, value: HOST }] },
  ]);
  certificate.sign(forge.pki.privateKeyFromPem(privateKey), forge.md.sha256.create());
  return { key: privateKey, cert: forge.pki.certificateToPem(certificate) };
}

async function startLocalSite() {
  const credentials = ephemeralCertificate();
  const fingerprint = new X509Certificate(credentials.cert).fingerprint256;
  const secret = randomBytes(32).toString('hex');
  const secretBytes = Buffer.from(secret);
  let handle;
  const server = createServer(credentials, async (incoming, reply) => {
    const supplied = Buffer.from(String(incoming.headers[SESSION_HEADER] || ''));
    if (
      incoming.headers.host !== HOST ||
      !incoming.url.startsWith('/') ||
      supplied.length !== secretBytes.length ||
      !timingSafeEqual(supplied, secretBytes)
    ) {
      reply.writeHead(403).end();
      return;
    }
    const controller = new AbortController();
    reply.once('close', () => controller.abort());
    try {
      const { method } = incoming;
      const headers = new Headers(incoming.headers);
      headers.delete(SESSION_HEADER);
      const body = method === 'GET' || method === 'HEAD' ? null : Readable.toWeb(incoming);
      const request = new Request(ORIGIN + incoming.url, {
        method,
        headers,
        body,
        duplex: 'half',
        signal: controller.signal,
      });
      const response = await handle(request);
      reply.writeHead(response.status, Object.fromEntries(response.headers));
      if (response.body) await pipeline(Readable.fromWeb(response.body), reply);
      else reply.end();
    } catch {
      if (!reply.headersSent && !reply.destroyed) reply.writeHead(500).end();
      else reply.destroy();
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return {
    port: server.address().port,
    close() {
      server.close();
      server.closeAllConnections();
    },
    bind(session, assetHandler) {
      handle = assetHandler;
      session.setCertificateVerifyProc(({ hostname, certificate }, done) => {
        const trusted =
          hostname === HOST && new X509Certificate(certificate.data).fingerprint256 === fingerprint;
        done(trusted ? 0 : -3);
      });
      session.webRequest.onBeforeSendHeaders(
        { urls: [ORIGIN + '/*'] },
        ({ requestHeaders }, done) =>
          done({ requestHeaders: { ...requestHeaders, [SESSION_HEADER]: secret } }),
      );
    },
  };
}

async function setBrowserProxy(session, system) {
  function proxyList(value) {
    return value
      .split(';')
      .map((item) => {
        const rule = item.trim();
        if (rule === 'DIRECT') return 'direct://';
        const match = /^(PROXY|HTTPS|SOCKS(?:4|5)?|QUIC) ([\w.:[\]-]+:\d+)$/.exec(rule);
        if (!match) return '';
        return (match[1] === 'PROXY' ? 'http' : match[1].toLowerCase()) + '://' + match[2];
      })
      .filter(Boolean)
      .join(',');
  }
  const [http, https] = await Promise.all([
    system.resolveProxy('http://www.tool.mistarg.cn/'),
    system.resolveProxy('https://www.tool.mistarg.cn/'),
  ]);
  await session.setProxy({
    mode: 'fixed_servers',
    proxyRules: `http=${proxyList(http) || 'direct://'};https=${proxyList(https) || 'direct://'}`,
    proxyBypassRules: HOST,
  });
}

module.exports = { HOST, setBrowserProxy, startLocalSite };
