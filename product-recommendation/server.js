import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const frontend = path.join(root, 'frontend');
const fastApi = 'http://127.0.0.1:8000';
const contentTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host || '127.0.0.1:3000'}`);
    if (requestUrl.pathname.startsWith('/api/') || requestUrl.pathname === '/health') {
      const body = request.method === 'GET' ? undefined : await new Promise((resolve, reject) => {
        let value = '';
        request.on('data', chunk => { value += chunk; });
        request.on('end', () => resolve(value));
        request.on('error', reject);
      });
      const upstream = await fetch(`${fastApi}${requestUrl.pathname}${requestUrl.search}`, {
        method: request.method,
        headers: {
          'content-type': request.headers['content-type'] || 'application/json',
          ...(request.headers.cookie ? { cookie: request.headers.cookie } : {})
        },
        body
      });
      const responseHeaders = { 'content-type': upstream.headers.get('content-type') || 'application/json' };
      const setCookies = upstream.headers.getSetCookie?.() || [];
      if (setCookies.length) responseHeaders['set-cookie'] = setCookies;
      response.writeHead(upstream.status, responseHeaders);
      response.end(Buffer.from(await upstream.arrayBuffer()));
      return;
    }

    const requested = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
    const filePath = path.join(frontend, path.normalize(requested).replace(/^([.][.][\\/])+/, ''));
    const file = await readFile(filePath);
    response.writeHead(200, { 'content-type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
    response.end(file);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('Not found');
  }
});

server.listen(3000, '127.0.0.1', () => console.log('Node gateway: http://127.0.0.1:3000'));
