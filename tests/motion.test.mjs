import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, serve, runScript } from './harness.mjs';

const DIR = join(ROOT, 'skills/motion');
const REFS = ['level', 'purpose', 'timing', 'easing', 'choreography', 'proof', 'measures', 'sources'];

let server;
before(async () => {
  server = await serve(join(ROOT, 'tests/fixtures/motion'));
});
after(() => server.close());

const motion = (page) => runScript('../../motion/scripts/motion.js', `${server.url}/${page}`);

test('a clean page passes and its motion is described', async () => {
  const report = await motion('good.html');
  assert.equal(report.pass, true, JSON.stringify(report.issues));
  assert.deepEqual(report.issues, []);
  assert.ok(report.transitions.n >= 2, JSON.stringify(report.transitions));
  assert.ok(report.transitions.curves.out >= 2, JSON.stringify(report.transitions.curves));
  for (const kind of ['over300', 'all', 'easeIn']) assert.deepEqual(report.transitions[kind], [], kind);
  assert.deepEqual(report.entrances, [], 'a popover from 0.96 is not scale(0)');
  assert.deepEqual(report.hover, [], 'a lift inside (hover: hover) is gated');
  assert.equal(report.reveals.hidden, 0, JSON.stringify(report.reveals));
  assert.equal(report.scroll.takeover, null);
  assert.deepEqual(report.loops.running, []);
  assert.deepEqual(report.reduced, { moving: [], animations: [], reveals: [], takeover: false });
});

test('the motion faults are reported, and only movement under reduced motion fails', async () => {
  const report = await motion('faults.html');
  assert.equal(report.pass, false);
  assert.ok(report.issues.length >= 2 && report.issues.every((i) => i.kind === 'reduced-motion' && i.rule === 'proof-2'), JSON.stringify(report.issues));
  assert.ok(report.issues.some((i) => /ticker/.test(i.at)), 'the ticker still moves');
  assert.ok(report.issues.some((i) => /reveal/.test(i.at)), 'the reveal still slides in');
  assert.ok(report.transitions.all.some((t) => /t-all/.test(t)), JSON.stringify(report.transitions));
  assert.ok(report.transitions.over300.some((t) => /t-slow.*450/.test(t)), JSON.stringify(report.transitions));
  assert.ok(report.transitions.easeIn.some((t) => /t-in/.test(t)), JSON.stringify(report.transitions));
  assert.ok(report.entrances.some((e) => /pop/.test(e)), JSON.stringify(report.entrances));
  assert.ok(report.hover.some((h) => /card/.test(h)), JSON.stringify(report.hover));
  assert.ok(report.reveals.hidden >= 3 && report.reveals.shown >= 3, JSON.stringify(report.reveals));
  assert.ok(report.loops.running.some((l) => /ticker/.test(l)), JSON.stringify(report.loops));
  assert.ok(report.loops.offscreen.some((l) => /ticker/.test(l)), JSON.stringify(report.loops));
});
