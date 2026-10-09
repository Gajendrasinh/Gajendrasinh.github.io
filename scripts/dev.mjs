// Local preview: builds, serves dist/ and rebuilds when content/, src/ or public/ change.
//   node scripts/dev.mjs [--port 5173] [--no-watch]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const args = process.argv.slice(2);
const port = Number(args.includes('--port') ? args[args.indexOf('--port') + 1] : 5173);

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };

async function rebuild(reason) {
  try {
    await build({ minify: false });
    console.log(`[${new Date().toLocaleTimeString()}] built${reason ? ` (${reason} changed)` : ''}`);
  } catch (error) {
    console.error(error.message);
  }
}

await rebuild();

createServer(async (request, response) => {
  const url = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  let file = path.join(DIST, path.normalize(url));
  if (!file.startsWith(DIST)) return response.writeHead(403).end();
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const data = await readFile(file);
    const total = data.length;
    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range ?? ''); // video seeking needs ranges
    const type = TYPES[path.extname(file)] ?? 'application/octet-stream';
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), total - 1) : total - 1;
      response.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${total}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
      return response.end(data.subarray(start, end + 1));
    }
    response.writeHead(200, { 'Content-Type': type, 'Content-Length': total, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
    response.end(data);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
}).listen(port, () => console.log(`Preview at http://localhost:${port}`));

if (!args.includes('--no-watch')) {
  let timer;
  for (const dir of ['content', 'src', 'public', 'schema']) {
    watch(path.join(ROOT, dir), { recursive: true }, (event, name) => {
      clearTimeout(timer);
      timer = setTimeout(() => rebuild(`${dir}/${name ?? ''}`), 120);
    });
  }
  console.log('Watching content/, src/, public/ and schema/. Refresh the browser after a rebuild.');
}
