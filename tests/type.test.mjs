import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ROOT, serve, runScript } from './harness.mjs';

let server;
before(async () => {
  server = await serve(join(ROOT, 'tests/fixtures/type'));
});
after(() => server.close());

const type = (page) => runScript('../../type/scripts/type.js', `${server.url}/${page}`);

test('board reports each candidate, its metrics and what it cannot set', async () => {
  const report = await type('board.html');
  assert.equal(report.mode, 'board');
  const by = Object.fromEntries(report.candidates.map((c) => [c.name, c]));
  assert.deepEqual(Object.keys(by), ['Full', 'Ascii', 'Gone']);
  assert.equal(by.Full.loaded, true);
  assert.equal(by.Full.missing, '');
  assert.deepEqual(by.Full.weights, ['400', '700']);
  assert.ok(by.Full.xHeight > 0.4 && by.Full.xHeight < 0.7, `x-height ${by.Full.xHeight}`);
  assert.ok(by.Full.capHeight > by.Full.xHeight);
  assert.ok(by.Full.avgWidth > 0.3 && by.Full.avgWidth < 0.8, `width ${by.Full.avgWidth}`);
  assert.equal(by.Ascii.loaded, true);
  assert.equal(by.Ascii.missing, 'éç');
  assert.equal(by.Gone.loaded, false);
  assert.equal(by.Gone.xHeight, null);
});

test('audit passes a clean page and describes its type', async () => {
  const report = await type('good.html');
  assert.equal(report.mode, 'audit');
  assert.equal(report.pass, true, JSON.stringify(report.issues));
  assert.deepEqual(report.issues, []);
  assert.equal(report.faces[0].name, 'Face');
  assert.ok(report.sizes.includes(16));
  assert.ok(report.weights.includes(400) && report.weights.includes(600));
  assert.equal(report.followsRoot, true);
  assert.equal(report.measure.n, 1);
  assert.ok(report.measure.median >= 60 && report.measure.median <= 85, `measure ${report.measure.median}`);
  assert.deepEqual(report.measure.outside, []);
  assert.deepEqual(report.fauxBold, []);
  assert.equal(report.fluid.length, 1);
  assert.ok(report.fluid[0].ratio <= 2.5);
  assert.ok(report.leading.some((l) => l.size === 16 && l.value === 1.6));
});

test('audit catches the type faults, and only the standards fail the report', async () => {
  const report = await type('faults.html');
  assert.equal(report.pass, false);
  const kinds = report.issues.map((i) => i.kind).sort();
  assert.deepEqual(kinds, ['resize', 'text-spacing'], JSON.stringify(report.issues));
  assert.equal(report.issues.find((i) => i.kind === 'resize').rule, 'WCAG 1.4.4');
  assert.match(report.issues.find((i) => i.kind === 'resize').at, /^h1/);
  assert.equal(report.issues.find((i) => i.kind === 'text-spacing').rule, 'WCAG 1.4.12');
  assert.match(report.issues.find((i) => i.kind === 'text-spacing').at, /\.tag/);
  assert.equal(report.followsRoot, false);
  assert.equal(report.measure.outside.length, 1);
  assert.match(report.measure.outside[0], /\.wide/);
  assert.equal(report.fauxBold.length, 1);
  assert.match(report.fauxBold[0], /^strong/);
  assert.ok(report.fluid.some((f) => f.ratio > 2.5));
});
