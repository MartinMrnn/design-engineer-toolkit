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
  assert.match(report.visuals[1440].kinds[0], /^img/, 'the hero image, not the faint drawing under the whole screen');
  assert.ok(report.textures.length >= 1, JSON.stringify(report.textures));
  assert.ok(report.contrast.length >= 2 && report.contrast.every((c) => c.ratio >= c.needs), JSON.stringify(report.contrast));
  assert.ok(!report.contrast.some((c) => /Doors/.test(c.at)), 'text on a solid panel is left to axe');
  assert.deepEqual(report.unmeasured, []);
  assert.deepEqual(report.shapes, [], 'a pill behind a tab is not a blob');
  assert.equal(report.shadows.mixed, false);
  assert.deepEqual(report.shadows.lost, [], 'a light ring and a lighter surface carry a shadow on a dark ground');
  assert.ok(report.shadows.distinct >= 2, JSON.stringify(report.shadows));
  assert.deepEqual(report.glass.nested, []);
  assert.equal(report.glass.reducedTransparency, true);
  for (const kind of ['unsized', 'blurry', 'soft', 'heavy', 'lazyFirst']) assert.deepEqual(report.images[kind], [], kind);
});

test('the imagery faults are reported, and only the texts over light images fail', async () => {
  const report = await imagery('faults.html');
  assert.equal(report.pass, false);
  assert.deepEqual(report.issues.map((i) => i.kind), ['text-over-image', 'text-over-image', 'text-over-image'], JSON.stringify(report.issues));
  assert.ok(report.issues.every((i) => i.rule === 'WCAG 1.4.3'));
  assert.match(report.issues.find((i) => /night of the hunter/.test(i.at)).detail, /1440.*390|390.*1440/);
  assert.ok(report.issues.some((i) => /Now showing/.test(i.at)), 'a caption with pointer-events: none is still measured');
  assert.ok(report.issues.some((i) => /Flat light poster/.test(i.at)), 'a flat image is not a ground of the text\'s own');
  assert.ok(report.unmeasured.some((u) => /Late show.*no frame/.test(u)), JSON.stringify(report.unmeasured));
  assert.ok(![...report.unmeasured, ...report.contrast.map((c) => c.at)].some((t) => /Thursday at 8 pm/.test(t)), 'visually hidden text is left out');
  assert.ok(report.shapes.some((s) => /round/.test(s)) && report.shapes.some((s) => /::before.*blur/.test(s)), JSON.stringify(report.shapes));
  assert.ok(report.unmeasured.some((u) => /Hidden caption.*covered/.test(u)) && report.unmeasured.some((u) => /Blended title.*blend mode difference/.test(u)), JSON.stringify(report.unmeasured));
  assert.equal(report.shadows.mixed, true);
  assert.equal(report.shadows.lost.length, 1, JSON.stringify(report.shadows));
  assert.equal(report.glass.nested.length, 1, JSON.stringify(report.glass));
  assert.equal(report.glass.reducedTransparency, false);
  assert.equal(report.images.unsized.length, 1, JSON.stringify(report.images));
  assert.equal(report.images.blurry.length, 1, 'an image inside a hidden parent is left out');
  assert.equal(report.images.lazyFirst.length, 1, JSON.stringify(report.images));
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

test('SKILL.md is the imagery skill, short, and names every reference', () => {
  const skill = text('SKILL.md');
  assert.match(skill, /^---\nname: imagery\n/);
  const lines = skill.trimEnd().split('\n').length;
  assert.ok(lines <= 150, `SKILL.md has ${lines} lines`);
  for (const name of REFS) assert.ok(skill.includes(`references/${name}.md`), `SKILL.md does not name ${name}.md`);
  assert.deepEqual(readdirSync(join(DIR, 'references')).sort(), REFS.map((name) => `${name}.md`).sort());
  assert.ok(!existsSync(join(DIR, '.gitkeep')));
});

test('every imagery rule follows the format', () => {
  const all = rules();
  assert.ok(all.length >= 30, `${all.length} rules`);
  const sources = new Set(keys());
  const known = measures();
  const seen = new Set();
  const kind = /^(standard \(WCAG \d\.\d+\.\d+(, \d\.\d+\.\d+)*\)|empirical finding|heuristic)$/;
  const one = 'script [a-z-]+|imagery audit|critic phases? [234](?:, [234])*';
  const check = new RegExp(`^(?:${one})(?: \\+ (?:${one}))*(?: · blocking)?$`);
  for (const row of all) {
    assert.equal(row.cells.length, 5, `${row.at}: ${row.cells.length} columns`);
    const [, why, type, source, checked] = row.cells;
    const id = idOf(row);
    assert.match(id ?? '', /^(level|source|treatment|finish|icon|proof)-\d+$/, `${row.at}: bad id`);
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

test('the imagery blocking core is exactly the agreed rules, plus the standards', () => {
  const blocking = rules().filter((row) => row.cells[4].endsWith(' · blocking') && !row.cells[2].startsWith('standard')).map(idOf).sort();
  assert.deepEqual(blocking, ['finish-1', 'level-1', 'level-2', 'level-3', 'source-1', 'source-2']);
  const standards = Object.fromEntries(rules().filter((row) => row.cells[2].startsWith('standard')).map((row) => [idOf(row), row.cells[2]]));
  assert.deepEqual(standards, {
    'icon-3': 'standard (WCAG 1.4.11)', 'proof-1': 'standard (WCAG 1.4.3)', 'proof-2': 'standard (WCAG 1.1.1)',
    'proof-3': 'standard (WCAG 2.2.2)', 'treatment-5': 'standard (WCAG 1.4.5)',
  });
});

test('every imagery source states its licence and is credited', () => {
  const lines = text('references/sources.md').split('\n').filter((line) => line.startsWith('- **'));
  assert.ok(lines.length >= 15, `${lines.length} sources`);
  for (const line of lines) assert.match(line, /Licence: \S/, line);
  const credits = new Set(readFileSync(join(ROOT, 'CREDITS.md'), 'utf8').split('\n').filter((line) => line.startsWith('|')).map((line) => cells(line)[0]));
  for (const key of keys()) assert.ok(credits.has(key), `CREDITS.md has no row "${key}"`);
});

test('nothing is left of the v0.3 imagery material', () => {
  for (const file of files()) assert.doesNotMatch(text(file), /charter|14-sources|assets\/Icons|cards and proposals|B2 plan|art director/i, file);
});
