/* Opens the storybook in Chrome and checks the real layout:
   after the book opens at 320px, the page does not scroll sideways,
   and each award title is fully inside the viewport, wrapped only
   on a space or the slash in "Psychotherapist/Counselor".
   Run: node scripts/check_open_overflow.mjs */
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const chromeBin = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const widths = [320, 390];

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

function serve() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    let path = normalize(join(root, decodeURIComponent(url.pathname)));
    if (!path.startsWith(root)) { res.writeHead(403); res.end(); return; }
    try {
      const info = await stat(path);
      if (info.isDirectory()) path = join(path, 'index.html');
      const body = await readFile(path);
      res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404); res.end();
    }
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function cdp(ws) {
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', event => {
    const msg = JSON.parse(event.data);
    if (!msg.id || !pending.has(msg.id)) return;
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
  });
  return (method, params = {}) => new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

const measure = `(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const root = document.documentElement;
  root.style.scrollBehavior = 'auto';
  root.classList.add('calm');
  if (!root.classList.contains('opened')) document.querySelector('#open').click();
  location.hash = '#home';
  const home = document.getElementById('home');
  for (let i = 0; i < 40 && !(root.classList.contains('opened') && home.classList.contains('active')); i++) await sleep(50);
  const doc = document.documentElement;
  const edge = doc.clientWidth;
  const linesOf = el => {
    const out = [];
    let cur = '', y = null;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent;
      for (let i = 0; i < text.length; i++) {
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const top = range.getBoundingClientRect().top;
        if (y !== null && Math.abs(top - y) > 3 && cur) { out.push(cur); cur = ''; }
        cur += text[i];
        y = top;
      }
    }
    if (cur) out.push(cur);
    return out;
  };
  const inside = el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.left >= -1 && r.right <= edge + 1 && el.scrollWidth <= el.clientWidth + 1;
  };
  const homeOverflow = doc.scrollWidth - edge;
  const awards = [...document.querySelectorAll('.aw-list li')].map(li => {
    const b = li.querySelector('b');
    const small = li.querySelector('small');
    const lines = linesOf(b);
    const title = b.textContent;
    let rest = title, boundary = true;
    for (const line of lines) {
      if (!rest.startsWith(line)) { boundary = false; break; }
      rest = rest.slice(line.length);
      if (rest && !/^[\\s/]/.test(rest) && !/[\\s/]$/.test(line)) { boundary = false; break; }
    }
    if (rest) boundary = false;
    return { title, lines, boundary, inside: inside(b) && inside(small) && inside(li) };
  });
  const chapters = [];
  for (const chap of document.querySelectorAll('.chap')) {
    location.hash = '#' + chap.id;
    for (let i = 0; i < 40 && !chap.classList.contains('active'); i++) await sleep(50);
    chapters.push({ id: chap.id, overflow: doc.scrollWidth - doc.clientWidth, active: chap.classList.contains('active') });
  }
  return { overflow: homeOverflow, edge, awards, chapters };
})()`;

const server = await serve();
const port = server.address().port;
const profile = await mkdtemp(join(tmpdir(), 'obc-overflow-'));
const chrome = spawn(chromeBin, [
  '--headless=new', '--no-sandbox', '--disable-dev-shm-usage',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'] });
let stderr = '';
chrome.stderr.on('data', chunk => { stderr += chunk; });
try {
  const endpoint = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Chrome did not open a DevTools port\n' + stderr)), 8000);
    const onExit = code => { clearTimeout(timer); reject(new Error('Chrome exited ' + code + '\n' + stderr)); };
    const check = () => {
      const match = stderr.match(/ws:\/\/127\.0\.0\.1:(\d+)\//);
      if (!match) return;
      clearTimeout(timer);
      chrome.off('exit', onExit);
      resolve(match[1]);
    };
    chrome.stderr.on('data', check);
    chrome.on('exit', onExit);
    check();
  });
  const targets = await (await fetch(`http://127.0.0.1:${endpoint}/json/list`)).json();
  const page = targets.find(target => target.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve); ws.addEventListener('error', reject); });
  const send = cdp(ws);
  await send('Page.enable');
  const problems = [];
  for (const width of widths) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: `http://127.0.0.1:${port}/storybook/?overflow=${width}` });
    await new Promise(resolve => {
      const timer = setTimeout(resolve, 2500);
      const done = () => { clearTimeout(timer); ws.removeEventListener('message', onMessage); resolve(); };
      const onMessage = event => { if (JSON.parse(event.data).method === 'Page.loadEventFired') done(); };
      ws.addEventListener('message', onMessage);
    });
    const result = await send('Runtime.evaluate', { expression: measure, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'measure failed');
    const value = result.result.value;
    console.log(width, JSON.stringify(value));
    if (value.overflow !== 0) problems.push(width + ' home overflow ' + value.overflow);
    for (const award of value.awards) {
      if (!award.inside || !award.boundary) problems.push(width + ' award ' + JSON.stringify(award));
    }
    for (const chap of value.chapters) {
      if (!chap.active || chap.overflow !== 0) problems.push(width + ' ' + chap.id + ' overflow ' + chap.overflow);
    }
  }
  ws.close();
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('open-book overflow checks passed');
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  chrome.kill();
  server.close();
  await new Promise(resolve => setTimeout(resolve, 300));
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
