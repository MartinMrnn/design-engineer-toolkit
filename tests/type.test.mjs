import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, serve, runScript } from './harness.mjs';

const DIR = join(ROOT, 'skills/type');
const REFS = ['voice', 'faces', 'pairing', 'roles', 'setting', 'loading', 'measures', 'sources'];

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

test('SKILL.md is the type skill, short, and names every reference', () => {
  const skill = text('SKILL.md');
  assert.match(skill, /^---\nname: type\n/);
  const lines = skill.trimEnd().split('\n').length;
  assert.ok(lines <= 150, `SKILL.md has ${lines} lines`);
  for (const name of REFS) {
    assert.ok(existsSync(join(DIR, `references/${name}.md`)), `${name}.md is missing`);
    assert.ok(skill.includes(`references/${name}.md`), `SKILL.md does not name ${name}.md`);
  }
  assert.deepEqual(readdirSync(join(DIR, 'references')).sort(), REFS.map((name) => `${name}.md`).sort());
  assert.ok(existsSync(join(DIR, 'assets/board.html')));
  assert.ok(!existsSync(join(DIR, '.gitkeep')));
});

test('every type rule follows the format', () => {
  const all = rules();
  assert.ok(all.length >= 25, `${all.length} rules`);
  const sources = new Set(keys());
  const known = measures();
  const seen = new Set();
  const kind = /^(standard \(WCAG \d\.\d+\.\d+(, \d\.\d+\.\d+)*\)|empirical finding|heuristic)$/;
  const one = 'script [a-z-]+|type (?:board|audit)|critic phases? [234](?:, [234])*';
  const check = new RegExp(`^(?:${one})(?: \\+ (?:${one}))*(?: · blocking)?$`);
  for (const row of all) {
    assert.equal(row.cells.length, 5, `${row.at}: ${row.cells.length} columns`);
    const [, why, type, source, checked] = row.cells;
    const id = idOf(row);
    assert.match(id ?? '', /^(voice|face|pairing|roles|setting|proof)-\d+$/, `${row.at}: bad id`);
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

test('the type blocking core is exactly the agreed rules, plus the standards', () => {
  const blocking = rules().filter((row) => row.cells[4].endsWith(' · blocking') && !row.cells[2].startsWith('standard')).map(idOf).sort();
  assert.deepEqual(blocking, ['face-1', 'face-3', 'pairing-1', 'roles-1', 'voice-1', 'voice-2']);
  const standards = Object.fromEntries(rules().filter((row) => row.cells[2].startsWith('standard')).map((row) => [idOf(row), row.cells[2]]));
  assert.deepEqual(standards, { 'proof-1': 'standard (WCAG 1.4.4)', 'proof-2': 'standard (WCAG 1.4.12)', 'proof-3': 'standard (WCAG 1.4.5)' });
});

test('every type source states its licence and is credited', () => {
  const lines = text('references/sources.md').split('\n').filter((line) => line.startsWith('- **'));
  assert.ok(lines.length >= 15, `${lines.length} sources`);
  for (const line of lines) assert.match(line, /Licence: \S/, line);
  const credits = new Set(readFileSync(join(ROOT, 'CREDITS.md'), 'utf8').split('\n').filter((line) => line.startsWith('|')).map((line) => cells(line)[0]));
  for (const key of keys()) assert.ok(credits.has(key), `CREDITS.md has no row "${key}"`);
});

test('nothing is left of the v0.3 type material', () => {
  for (const file of files()) assert.doesNotMatch(text(file), /charter|tokens\.json|14-sources|art director|--fluid-|\.display-xl/i, file);
});
