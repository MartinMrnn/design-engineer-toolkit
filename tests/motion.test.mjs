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
  assert.ok(report.loops.running.every((l) => /spinner/.test(l)), JSON.stringify(report.loops));
  assert.deepEqual(report.reduced, { moving: [], animations: [], scrolled: [], reveals: [], takeover: false }, 'a spinner may keep turning');
  assert.deepEqual(report.reveals.lost, [], 'a block centred by a transform is not hidden');
  assert.deepEqual(report.transitions.layout, []);
});

test('the motion faults are reported, and only movement under reduced motion fails', async () => {
  const report = await motion('faults.html');
  assert.equal(report.pass, false);
  assert.ok(report.issues.length >= 2 && report.issues.every((i) => i.kind === 'reduced-motion' && i.rule === 'proof-2'), JSON.stringify(report.issues));
  assert.ok(report.issues.some((i) => /ticker/.test(i.at)), 'the ticker still moves');
  assert.ok(report.issues.some((i) => /reveal/.test(i.at)), 'the reveal still slides in');
  assert.ok(report.issues.some((i) => i.at === 'svg.pulse-icon circle'), 'an element with no class is named after its ancestor');
  assert.match(report.scroll.depth, /^[1-9]\d* of \d+ px$/);
  const at = (re, what) => assert.ok(report.issues.some((i) => re.test(i.at) && what.test(i.detail)), `${re} ${what}: ${JSON.stringify(report.issues)}`);
  at(/js-ticker "Partners"/, /keeps moving/);
  at(/scrub/, /moves as the page scrolls/);
  at(/intro/, /moves as the page loads/);
  assert.ok(report.loops.offscreen.some((l) => /js-ticker/.test(l)), 'a loop driven by script is seen off screen');
  assert.ok(report.transitions.layout.some((t) => /t-left: left/.test(t)), JSON.stringify(report.transitions));
  assert.ok(report.transitions.easeIn.some((t) => /t-mixed: opacity/.test(t)), JSON.stringify(report.transitions));
  assert.ok(report.transitions.all.some((t) => /t-all/.test(t)), JSON.stringify(report.transitions));
  assert.ok(report.transitions.over300.some((t) => /t-slow.*450/.test(t)), JSON.stringify(report.transitions));
  assert.ok(report.transitions.easeIn.some((t) => /t-in/.test(t)), JSON.stringify(report.transitions));
  assert.ok(report.entrances.some((e) => /pop/.test(e)), JSON.stringify(report.entrances));
  assert.ok(report.hover.some((h) => /card/.test(h)), JSON.stringify(report.hover));
  assert.ok(report.reveals.hidden >= 3 && report.reveals.shown >= 3, JSON.stringify(report.reveals));
  assert.ok(report.loops.running.some((l) => /ticker/.test(l)), JSON.stringify(report.loops));
  assert.ok(report.loops.offscreen.some((l) => /ticker/.test(l)), JSON.stringify(report.loops));
});

const text = (file) => readFileSync(join(DIR, file), 'utf8');
const files = () => ['SKILL.md', ...REFS.map((name) => `references/${name}.md`)];
const cells = (line) => line.trim().slice(1, -1).split('|').map((cell) => cell.trim());
const rules = () => files().flatMap((file) => {
  const lines = text(file).split('\n');
  return lines.flatMap((line, i) => {
    if (line.trim() !== '| Rule | Why | Kind | Source | Checked by |') return [];
    const rows = [];
    for (let j = i + 2; lines[j]?.startsWith('|'); j++) rows.push({ at: `${file}:${j + 1}`, cells: cells(lines[j]) });
    return rows;
  });
});
const idOf = (row) => row.cells[0].match(/^`([a-z]+-\d+)` · \S/)?.[1];
const keys = () => [...text('references/sources.md').matchAll(/^- \*\*(.+?)\*\*/gm)].map((m) => m[1]);
const measures = () => new Set([...readFileSync(join(ROOT, 'skills/studio/scripts/check.js'), 'utf8').split('\nasync')[0].matchAll(/\(([a-z-]+)\)/g)].map((m) => m[1]));

test('SKILL.md is the motion skill, short, and names every reference', () => {
  const skill = text('SKILL.md');
  assert.match(skill, /^---\nname: motion\n/);
  const lines = skill.trimEnd().split('\n').length;
  assert.ok(lines <= 150, `SKILL.md has ${lines} lines`);
  for (const name of REFS) assert.ok(skill.includes(`references/${name}.md`), `SKILL.md does not name ${name}.md`);
  assert.deepEqual(readdirSync(join(DIR, 'references')).sort(), REFS.map((name) => `${name}.md`).sort());
  assert.ok(!existsSync(join(DIR, '.gitkeep')));
});

test('every motion rule follows the format', () => {
  const all = rules();
  assert.ok(all.length >= 30, `${all.length} rules`);
  const sources = new Set(keys());
  const known = measures();
  const seen = new Set();
  const kind = /^(standard \(WCAG \d\.\d+\.\d+(, \d\.\d+\.\d+)*\)|empirical finding|heuristic)$/;
  const one = 'script [a-z-]+|motion audit|critic phases? [234](?:, [234])*';
  const check = new RegExp(`^(?:${one})(?: \\+ (?:${one}))*(?: · blocking)?$`);
  for (const row of all) {
    assert.equal(row.cells.length, 5, `${row.at}: ${row.cells.length} columns`);
    const [, why, type, source, checked] = row.cells;
    const id = idOf(row);
    assert.match(id ?? '', /^(level|purpose|timing|easing|choreography|proof)-\d+$/, `${row.at}: bad id`);
    assert.ok(!seen.has(id), `${row.at}: ${id} is used twice`);
    seen.add(id);
    assert.ok(why.length > 0, `${row.at}: no why`);
    assert.match(type, kind, `${row.at}: bad kind`);
    for (const key of source.split(', ')) assert.ok(sources.has(key), `${row.at}: source "${key}" is not in sources.md`);
    assert.match(checked, check, `${row.at}: bad check`);
    for (const m of checked.matchAll(/script ([a-z-]+)/g)) assert.ok(known.has(m[1]), `${row.at}: no measure "${m[1]}"`);
    if (type.startsWith('standard')) assert.ok(checked.endsWith(' · blocking'), `${row.at}: a standard must block`);
  }
});

test('the motion blocking core is exactly the agreed rules, plus the standards', () => {
  const blocking = rules().filter((row) => row.cells[4].endsWith(' · blocking') && !row.cells[2].startsWith('standard')).map(idOf).sort();
  assert.deepEqual(blocking, ['level-1', 'level-3', 'proof-2', 'purpose-1']);
  const standards = Object.fromEntries(rules().filter((row) => row.cells[2].startsWith('standard')).map((row) => [idOf(row), row.cells[2]]));
  assert.deepEqual(standards, { 'proof-1': 'standard (WCAG 2.3.1)' });
});

test('every motion source states its licence and is credited', () => {
  const lines = text('references/sources.md').split('\n').filter((line) => line.startsWith('- **'));
  assert.ok(lines.length >= 15, `${lines.length} sources`);
  for (const line of lines) assert.match(line, /Licence: \S/, line);
  const credits = new Set(readFileSync(join(ROOT, 'CREDITS.md'), 'utf8').split('\n').filter((line) => line.startsWith('|')).map((line) => cells(line)[0]));
  for (const key of keys()) assert.ok(credits.has(key), `CREDITS.md has no row "${key}"`);
});

test('nothing is left of the v0.3 motion material', () => {
  for (const file of files()) assert.doesNotMatch(text(file), /charter|12-motion|cards and proposals|B2 plan|art director|gsap@3\.15|lenis@1\.3\.26/i, file);
});
