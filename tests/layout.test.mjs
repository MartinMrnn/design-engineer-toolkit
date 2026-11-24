import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, serve, runScript } from './harness.mjs';

const DIR = join(ROOT, 'skills/layout');
const REFS = ['level', 'grid', 'space', 'hierarchy', 'shape', 'responsive', 'measures', 'sources'];

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

test('SKILL.md is the layout skill, short, and names every reference', () => {
  const skill = text('SKILL.md');
  assert.match(skill, /^---\nname: layout\n/);
  const lines = skill.trimEnd().split('\n').length;
  assert.ok(lines <= 150, `SKILL.md has ${lines} lines`);
  for (const name of REFS) assert.ok(skill.includes(`references/${name}.md`), `SKILL.md does not name ${name}.md`);
  assert.deepEqual(readdirSync(join(DIR, 'references')).sort(), REFS.map((name) => `${name}.md`).sort());
  assert.ok(!existsSync(join(DIR, '.gitkeep')));
});

test('every layout rule follows the format', () => {
  const all = rules();
  assert.ok(all.length >= 30, `${all.length} rules`);
  const sources = new Set(keys());
  const known = measures();
  const seen = new Set();
  const kind = /^(standard \(WCAG \d\.\d+\.\d+(, \d\.\d+\.\d+)*\)|empirical finding|heuristic)$/;
  const one = 'script [a-z-]+|layout audit|critic phases? [234](?:, [234])*';
  const check = new RegExp(`^(?:${one})(?: \\+ (?:${one}))*(?: · blocking)?$`);
  for (const row of all) {
    assert.equal(row.cells.length, 5, `${row.at}: ${row.cells.length} columns`);
    const [, why, type, source, checked] = row.cells;
    const id = idOf(row);
    assert.match(id ?? '', /^(level|grid|space|hierarchy|shape|proof)-\d+$/, `${row.at}: bad id`);
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

test('the layout blocking core is exactly the agreed rules, plus the standards', () => {
  const blocking = rules().filter((row) => row.cells[4].endsWith(' · blocking') && !row.cells[2].startsWith('standard')).map(idOf).sort();
  assert.deepEqual(blocking, ['hierarchy-1', 'level-1', 'level-2', 'level-3', 'proof-2', 'space-2']);
  const standards = Object.fromEntries(rules().filter((row) => row.cells[2].startsWith('standard')).map((row) => [idOf(row), row.cells[2]]));
  assert.deepEqual(standards, { 'hierarchy-7': 'standard (WCAG 1.3.2)', 'proof-1': 'standard (WCAG 1.4.10)', 'proof-9': 'standard (WCAG 2.4.11)' });
});

test('each visual law left by ux has its layout rule', () => {
  const table = text('references/hierarchy.md');
  const laws = [['Proximity', 'space-2'], ['Similarity', 'hierarchy-5'], ['Common Region', 'space-3'], ['Uniform Connectedness', 'hierarchy-6'], ['Prägnanz', 'shape-2'], ['Von Restorff', 'hierarchy-1']];
  for (const [law, id] of laws) assert.match(table, new RegExp(`${law}.*\`${id}\``), `${law} has no rule`);
});

test('every layout source states its licence and is credited', () => {
  const lines = text('references/sources.md').split('\n').filter((line) => line.startsWith('- **'));
  assert.ok(lines.length >= 15, `${lines.length} sources`);
  for (const line of lines) assert.match(line, /Licence: \S/, line);
  const credits = new Set(readFileSync(join(ROOT, 'CREDITS.md'), 'utf8').split('\n').filter((line) => line.startsWith('|')).map((line) => cells(line)[0]));
  for (const key of keys()) assert.ok(credits.has(key), `CREDITS.md has no row "${key}"`);
});

test('nothing is left of the v0.3 layout material', () => {
  for (const file of files()) assert.doesNotMatch(text(file), /charter|tokens\.json|06-structure|10-shape|13-rules|B2 plan|--fluid-|art director/i, file);
});
