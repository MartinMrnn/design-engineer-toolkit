import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT, serve, runScript, read } from './harness.mjs';

const OUT = join(ROOT, 'tests/.out');
let server;

before(async () => {
  server = await serve(join(ROOT, 'tests/fixtures'));
});

after(() => server.close());

const capture = (page) => runScript('capture.js', `${server.url}/${page}`, { out: OUT });

test('capture.js fits the MCP sandbox', async () => {
  const source = await read('capture.js');
  assert.doesNotMatch(source, /\bprocess\.|\brequire\(|^\s*import\s/m, 'Node globals are not available in the MCP sandbox');
  assert.match(source, /^\s*const OUT = '__OUT__';$/m, "whoever installs it replaces the exact literal '__OUT__'");
  assert.match(source.trim().replace(/^(\/\/.*\n)+/, ''), /^async \(page\) =>/);
});

test('capture.js writes a desktop and a mobile contact sheet', async () => {
  const report = await capture('good.html');
  assert.equal(report.files.length, 2);
  assert.match(report.files[0], /good-desktop\.png$/);
  assert.match(report.files[1], /good-mobile\.png$/);
  for (const file of report.files) {
    const bytes = await readFile(file);
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.ok((await stat(file)).size > 5000, `${file} is suspiciously small`);
  }
  // The page is several screens long: scrolling must have produced several frames, down to the end.
  for (const sheet of report.sheets) {
    assert.ok(sheet.frames >= 3, `${sheet.viewport}: ${sheet.frames} frames`);
    assert.equal(sheet.reachedEnd, true, `${sheet.viewport} did not reach the end`);
  }
});

test('capture.js follows a page that scrolls inside a container', async () => {
  const report = await capture('container.html');
  for (const sheet of report.sheets) {
    assert.equal(sheet.container, true);
    assert.equal(sheet.frames, 5, `${sheet.viewport}: one frame per section expected`);
    assert.equal(sheet.reachedEnd, true);
  }
});

test('capture.js reaches the end of a long page within its frame budget', async () => {
  const report = await capture('long.html');
  for (const sheet of report.sheets) {
    assert.equal(sheet.reachedEnd, true, `${sheet.viewport} stopped before the end`);
    assert.ok(sheet.frames <= 16, `${sheet.viewport}: ${sheet.frames} frames`);
    assert.ok(sheet.step > 900, `${sheet.viewport}: frames should be spaced out, got ${sheet.step}px`);
  }
});
