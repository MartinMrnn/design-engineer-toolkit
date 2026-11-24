import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ROOT, serve, runScript } from './harness.mjs';

let server;
before(async () => {
  server = await serve(join(ROOT, 'tests/fixtures/layout'));
});
after(() => server.close());

const layout = (page) => runScript('../../layout/scripts/layout.js', `${server.url}/${page}`);

test('a clean page passes and its layout is described', async () => {
  const report = await layout('good.html');
  assert.equal(report.pass, true, JSON.stringify(report.issues));
  assert.deepEqual(report.issues, []);
  assert.equal(report.maxCols, 3);
  assert.ok(report.sections.some((s) => s.cols === 3 && s.phone === 1), JSON.stringify(report.sections));
  assert.deepEqual(report.proximity.faults, []);
  assert.ok(report.proximity.closer >= 2, JSON.stringify(report.proximity));
  assert.deepEqual(report.crushed, []);
  assert.ok(report.radii.nested.length && report.radii.nested.every((n) => n.startsWith('concentric')), JSON.stringify(report.radii));
  assert.deepEqual(report.reordered, []);
  assert.equal(report.firstScreen[1440].h1Whole, true);
  assert.equal(report.firstScreen[1440].filled, 1);
});

test('the layout faults are reported, and only the hidden focus fails', async () => {
  const report = await layout('faults.html');
  assert.equal(report.pass, false);
  assert.deepEqual(report.issues.map((i) => i.kind), ['focus-obscured'], JSON.stringify(report.issues));
  assert.equal(report.issues[0].rule, 'WCAG 2.4.11');
  assert.match(report.issues[0].at, /^a/);
  assert.equal(report.proximity.faults.length, 1, JSON.stringify(report.proximity));
  assert.match(report.proximity.faults[0], /near/);
  assert.ok(report.crushed.some((c) => /^(390|320) px/.test(c)), JSON.stringify(report.crushed));
  assert.ok(report.radii.nested.some((n) => n.startsWith('same')), JSON.stringify(report.radii));
  assert.equal(report.reordered.length, 1, JSON.stringify(report.reordered));
  assert.match(report.reordered[0], /swap/);
});
