import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, serve, runScript } from './harness.mjs';

const DIR = join(ROOT, 'skills/components');
const REFS = ['system', 'element', 'patterns', 'focus', 'state', 'finishing', 'measures', 'sources'];

let server;
before(async () => {
  server = await serve(join(ROOT, 'tests/fixtures/components'));
});
after(() => server.close());

const components = (page) => runScript('../../components/scripts/components.js', `${server.url}/${page}`);

test('a clean page passes and its components are described', async () => {
  const report = await components('good.html');
  assert.equal(report.pass, true, JSON.stringify(report.issues));
  assert.deepEqual(report.issues, []);
  assert.ok(report.focus.kinds.drawn >= 8, JSON.stringify(report.focus));
  assert.deepEqual(report.focus.unmeasured, [], 'every ring is on a flat ground');
  assert.ok(report.focus.rings.some((r) => /Voir les horaires.*9\.\d:1/.test(r)), 'the dark band has its own ring');
  assert.ok(report.overlays.some((o) => /Menu/.test(o.at) && o.expanded === 'false → true' && o.escape === 'closes' && o.returns === 'trigger'), JSON.stringify(report.overlays));
  assert.ok(report.overlays.some((o) => o.modal && o.focus === 'inside' && !o.leaves && o.returns === 'trigger'), 'the dialog holds and returns focus');
  assert.equal(report.bypass.main, true);
  assert.ok(report.live >= 1);
});

test('only the ring contrast and the label in name fail; the rest is reported', async () => {
  const report = await components('faults.html');
  assert.equal(report.pass, false);
  const kinds = (k) => report.issues.filter((i) => i.kind === k);
  assert.ok(kinds('focus-contrast').some((i) => /pale/.test(i.at)), JSON.stringify(report.issues));
  assert.ok(kinds('label-in-name').some((i) => /Envoyer/.test(i.detail)), JSON.stringify(report.issues));
  for (const k of ['overlay-state', 'overlay-escape', 'overlay-focus', 'overlay-leak', 'menu-role', 'tabindex', 'disabled-submit', 'bypass']) assert.ok(kinds(k).length, `${k}: ${JSON.stringify(report.issues)}`);
  assert.ok(kinds('overlay-state').every((i) => /burger/.test(i.at)), 'a trigger with aria-expanded is not flagged');
  assert.ok(kinds('overlay-focus').some((i) => /faq/.test(i.at)));
  assert.ok(kinds('overlay-leak').some((i) => /open-quote/.test(i.at)));
  const failing = new Set(report.issues.filter((i) => ['focus-contrast', 'label-in-name'].includes(i.kind)).map((i) => i.rule));
  assert.deepEqual([...failing].sort(), ['element-4', 'focus-2']);
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

test('SKILL.md is the components skill, short, and names every reference', () => {
  const skill = text('SKILL.md');
  assert.match(skill, /^---\nname: components\n/);
  const lines = skill.trimEnd().split('\n').length;
  assert.ok(lines <= 150, `SKILL.md has ${lines} lines`);
  for (const name of REFS) assert.ok(skill.includes(`references/${name}.md`), `SKILL.md does not name ${name}.md`);
  assert.deepEqual(readdirSync(join(DIR, 'references')).sort(), REFS.map((name) => `${name}.md`).sort());
  assert.ok(!existsSync(join(DIR, '.gitkeep')));
});

test('every components rule follows the format', () => {
  const all = rules();
  assert.ok(all.length >= 35, `${all.length} rules`);
  const sources = new Set(keys());
  const known = measures();
  const seen = new Set();
  const kind = /^(standard \(WCAG \d\.\d+\.\d+(, \d\.\d+\.\d+)*\)|empirical finding|heuristic)$/;
  const one = 'script [a-z-]+|components audit|critic phases? [234](?:, [234])*';
  const check = new RegExp(`^(?:${one})(?: \\+ (?:${one}))*(?: · blocking)?$`);
  for (const row of all) {
    assert.equal(row.cells.length, 5, `${row.at}: ${row.cells.length} columns`);
    const [, why, type, source, checked] = row.cells;
    const id = idOf(row);
    assert.match(id ?? '', /^(system|element|pattern|focus|state|finish)-\d+$/, `${row.at}: bad id`);
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

test('the components blocking core is exactly the agreed rules, plus the standards', () => {
  const blocking = rules().filter((row) => row.cells[4].endsWith(' · blocking') && !row.cells[2].startsWith('standard')).map(idOf).sort();
  assert.deepEqual(blocking, ['element-1', 'finish-1', 'pattern-1']);
  const standards = Object.fromEntries(rules().filter((row) => row.cells[2].startsWith('standard')).map((row) => [idOf(row), row.cells[2]]));
  assert.deepEqual(standards, {
    'element-2': 'standard (WCAG 4.1.2)', 'element-3': 'standard (WCAG 1.3.1)', 'element-4': 'standard (WCAG 2.5.3)',
    'pattern-4': 'standard (WCAG 1.4.13)', 'pattern-6': 'standard (WCAG 2.5.7)',
    'focus-2': 'standard (WCAG 1.4.11)', 'focus-4': 'standard (WCAG 2.4.1)',
  });
});

test('every components source states its licence and is credited', () => {
  const lines = text('references/sources.md').split('\n').filter((line) => line.startsWith('- **'));
  assert.ok(lines.length >= 12, `${lines.length} sources`);
  for (const line of lines) assert.match(line, /Licence: \S/, line);
  const credits = new Set(readFileSync(join(ROOT, 'CREDITS.md'), 'utf8').split('\n').filter((line) => line.startsWith('|')).map((line) => cells(line)[0]));
  for (const key of keys()) assert.ok(credits.has(key), `CREDITS.md has no row "${key}"`);
});

test('no example comes from the test projects', () => {
  for (const file of files()) assert.doesNotMatch(text(file), /avocat|lawyer|cinéma|cinema|séance|screening/i, file);
});
