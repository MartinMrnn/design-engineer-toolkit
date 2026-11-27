import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, serve, runScript } from './harness.mjs';

const DIR = join(ROOT, 'skills/imagery');
const REFS = ['level', 'source', 'treatment', 'finish', 'icons', 'media', 'measures', 'sources'];

let server;
before(async () => {
  server = await serve(join(ROOT, 'tests/fixtures/imagery'));
});
after(() => server.close());

const imagery = (page) => runScript('../../imagery/scripts/imagery.js', `${server.url}/${page}`);

test('a clean page passes and its imagery is described', async () => {
  const report = await imagery('good.html');
  assert.equal(report.pass, true, JSON.stringify(report.issues));
  assert.deepEqual(report.issues, []);
  assert.ok(report.visuals[1440].share >= 40, JSON.stringify(report.visuals));
  assert.ok(report.contrast.length >= 2 && report.contrast.every((c) => c.ratio >= c.needs), JSON.stringify(report.contrast));
  assert.deepEqual(report.shapes, []);
  assert.equal(report.shadows.mixed, false);
  assert.ok(report.shadows.distinct >= 2, JSON.stringify(report.shadows));
  assert.deepEqual(report.glass.nested, []);
  assert.equal(report.glass.reducedTransparency, true);
  for (const kind of ['unsized', 'blurry', 'soft', 'heavy', 'lazyFirst']) assert.deepEqual(report.images[kind], [], kind);
});

test('the imagery faults are reported, and only the text over the light image fails', async () => {
  const report = await imagery('faults.html');
  assert.equal(report.pass, false);
  assert.deepEqual(report.issues.map((i) => i.kind), ['text-over-image'], JSON.stringify(report.issues));
  assert.equal(report.issues[0].rule, 'WCAG 1.4.3');
  assert.match(report.issues[0].detail, /1440.*390|390.*1440/);
  assert.ok(report.shapes.some((s) => /round/.test(s)) && report.shapes.some((s) => /::before.*blur/.test(s)), JSON.stringify(report.shapes));
  assert.equal(report.shadows.mixed, true);
  assert.equal(report.glass.nested.length, 1, JSON.stringify(report.glass));
  assert.equal(report.glass.reducedTransparency, false);
  assert.equal(report.images.unsized.length, 1, JSON.stringify(report.images));
  assert.ok(report.images.blurry.length >= 1, JSON.stringify(report.images));
  assert.equal(report.images.lazyFirst.length, 1, JSON.stringify(report.images));
});
