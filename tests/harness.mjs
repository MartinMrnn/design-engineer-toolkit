import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPTS = join(ROOT, 'skills/studio/scripts');

const TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

// A minimal static server for the fixtures.
export async function serve(dir) {
  const server = createServer(async (req, res) => {
    const path = join(dir, decodeURIComponent(new URL(req.url, 'http://local').pathname));
    try {
      const body = await readFile(path);
      res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

// Uses the installed Google Chrome when there is one, otherwise Playwright's Chromium.
async function launch() {
  try {
    return await chromium.launch({ channel: 'chrome' });
  } catch {
    return await chromium.launch();
  }
}

export const read = (name) => readFile(join(SCRIPTS, name), 'utf8');

// capture.js holds this exact literal once; whoever installs it replaces it with the output folder.
const TOKEN = "'__OUT__'";

// Builds the function the Playwright MCP server calls: it evaluates "(" + code + ")".
// A JSON string is always a valid JavaScript string literal.
function compile(source, out) {
  const parts = source.split(TOKEN);
  if (parts.length > 2) throw new Error(`expected ${TOKEN} at most once, found ${parts.length - 1}`);
  const code = parts.length === 2 ? parts[0] + JSON.stringify(out) + parts[1] : source;
  return new Function(`return (${code});`)();
}

// Runs a script of skills/studio/scripts/ with an open page, as browser_run_code_unsafe does.
// `after(page)` runs on the same page once the script has returned; its result lands in report.after.
export async function runScript(name, pageUrl, { out, after } = {}) {
  if (out) await mkdir(out, { recursive: true });
  const fn = compile(await read(name), out);
  const browser = await launch();
  try {
    const page = await (await browser.newContext()).newPage();
    await page.goto(pageUrl);
    const report = await fn(page);
    if (after) report.after = await after(page);
    return report;
  } finally {
    await browser.close();
  }
}
