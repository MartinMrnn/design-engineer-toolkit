import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './harness.mjs';

const DIR = join(ROOT, 'skills/ux');
const REFS = ['showcase', 'app', 'words', 'behaviour', 'states', 'laws', 'sources'];
const read = (file) => readFileSync(join(DIR, file), 'utf8');
const files = () => ['SKILL.md', ...REFS.map((name) => `references/${name}.md`)];
const cells = (line) => line.trim().slice(1, -1).split('|').map((cell) => cell.trim());

// Every data row of every table with this exact header, across the skill's files.
const table = (header) => files().flatMap((file) => {
  const lines = read(file).split('\n');
  return lines.flatMap((line, i) => {
    if (line.trim() !== header) return [];
    const rows = [];
    for (let j = i + 2; lines[j]?.startsWith('|'); j++) rows.push({ at: `${file}:${j + 1}`, cells: cells(lines[j]) });
    return rows;
  });
});
const rules = () => table('| Rule | Why | Kind | Source | Checked by |');
const laws = () => table('| Law | What it really says | Kind | Source | Misuse | Serves |');
const idOf = (row) => row.cells[0].match(/^`([a-z]+-\d+)` · \S/)?.[1];
const keys = () => [...read('references/sources.md').matchAll(/^- \*\*(.+?)\*\*/gm)].map((m) => m[1]);
const splitKeys = (cell) => cell.split(', ').map((key) => key.trim());
const measures = () => new Set([...readFileSync(join(ROOT, 'skills/studio/scripts/check.js'), 'utf8').split('\nasync')[0].matchAll(/\(([a-z-]+)\)/g)].map((m) => m[1]));

const LAWS = ['Aesthetic-Usability Effect', 'Choice Overload', 'Chunking', 'Cognitive Bias', 'Cognitive Load', 'Doherty Threshold', "Fitts's Law", 'Flow', 'Goal-Gradient Effect', "Hick's Law", "Jakob's Law", 'Law of Common Region', 'Law of Proximity', 'Law of Prägnanz', 'Law of Similarity', 'Law of Uniform Connectedness', 'Mental Model', "Miller's Law", "Occam's Razor", 'Paradox of the Active User', 'Pareto Principle', "Parkinson's Law", 'Peak-End Rule', "Postel's Law", 'Selective Attention', 'Serial Position Effect', "Tesler's Law", 'Von Restorff Effect', 'Working Memory', 'Zeigarnik Effect'];
const VISUAL = ['Law of Common Region', 'Law of Proximity', 'Law of Prägnanz', 'Law of Similarity', 'Law of Uniform Connectedness', 'Von Restorff Effect'];

test('SKILL.md is the ux skill, short, and names every reference', () => {
  const skill = read('SKILL.md');
  assert.match(skill, /^---\nname: ux\n/);
  const lines = skill.trimEnd().split('\n').length;
  assert.ok(lines <= 150, `SKILL.md has ${lines} lines`);
  for (const name of REFS) {
    assert.ok(existsSync(join(DIR, `references/${name}.md`)), `${name}.md is missing`);
    assert.ok(skill.includes(`references/${name}.md`), `SKILL.md does not name ${name}.md`);
  }
});

test('every rule follows the format', () => {
  const all = rules();
  assert.equal(all.length, 73, `${all.length} rules`);
  const sources = new Set(keys());
  const known = measures();
  const seen = new Set();
  const kind = /^(standard \(WCAG \d\.\d+\.\d+(, \d\.\d+\.\d+)*\)|empirical finding|heuristic)$/;
  const one = 'script [a-z-]+|critic phases? [234](?:, [234])*';
  const check = new RegExp(`^(?:${one})(?: \\+ (?:${one}))*(?: · blocking)?$`);
  for (const row of all) {
    assert.equal(row.cells.length, 5, `${row.at}: ${row.cells.length} columns`);
    const [, why, type, source, checked] = row.cells;
    const id = idOf(row);
    assert.match(id ?? '', /^(goal|path|thread|words|behaviour|states)-\d+$/, `${row.at}: bad id`);
    assert.ok(!seen.has(id), `${row.at}: ${id} is used twice`);
    seen.add(id);
    assert.ok(why.length > 0, `${row.at}: no why`);
    assert.match(type, kind, `${row.at}: bad kind`);
    for (const key of splitKeys(source)) assert.ok(sources.has(key), `${row.at}: source "${key}" is not in sources.md`);
    assert.match(checked, check, `${row.at}: bad check`);
    for (const m of checked.matchAll(/script ([a-z-]+)/g)) assert.ok(known.has(m[1]), `${row.at}: no measure "${m[1]}"`);
    if (type.startsWith('standard')) assert.ok(checked.endsWith(' · blocking'), `${row.at}: a standard must block`);
  }
});

test('the blocking core is exactly the agreed rules, plus the standards', () => {
  const blocking = rules().filter((row) => row.cells[4].endsWith(' · blocking') && !row.cells[2].startsWith('standard')).map(idOf).sort();
  assert.deepEqual(blocking, ['goal-1', 'path-1', 'states-1', 'thread-1', 'thread-2', 'words-1']);
});

test('laws.md covers the 30 laws, each with what it serves', () => {
  const rows = laws();
  assert.deepEqual(rows.map((row) => row.cells[0]).sort(), [...LAWS].sort());
  const ids = new Set(rules().map(idOf));
  const sources = new Set(keys());
  for (const row of rows) {
    assert.equal(row.cells.length, 6, `${row.at}: ${row.cells.length} columns`);
    const [law, , type, source, misuse, serves] = row.cells;
    assert.match(type, /^(empirical finding|heuristic)$/, `${row.at}: bad kind`);
    for (const key of splitKeys(source)) assert.ok(sources.has(key), `${row.at}: source "${key}" is not in sources.md`);
    assert.ok(misuse.length > 0, `${row.at}: no misuse`);
    if (VISUAL.includes(law)) { assert.equal(serves, 'layout', `${row.at}`); continue; }
    if (serves.startsWith('not used: ')) continue;
    const cited = [...serves.matchAll(/`([a-z]+-\d+)`/g)].map((m) => m[1]);
    assert.ok(cited.length > 0, `${row.at}: serves nothing`);
    for (const id of cited) assert.ok(ids.has(id), `${row.at}: no rule ${id}`);
  }
});

test('every source states its licence and is credited', () => {
  const lines = read('references/sources.md').split('\n').filter((line) => line.startsWith('- **'));
  assert.ok(lines.length >= 15, `${lines.length} sources`);
  for (const line of lines) assert.match(line, /Licence: \S/, line);
  const credits = new Set(readFileSync(join(ROOT, 'CREDITS.md'), 'utf8').split('\n').filter((line) => line.startsWith('|')).map((line) => cells(line)[0]));
  for (const key of keys()) assert.ok(credits.has(key), `CREDITS.md has no row "${key}"`);
});