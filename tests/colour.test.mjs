import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, writeFileSync, mkdtempSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { crc32, deflateSync } from 'node:zlib';
import { ROOT } from './harness.mjs';

const DIR = join(ROOT, 'skills/colour');
const SCRIPT = join(DIR, 'scripts/colour.py');
const FIXTURE = join(ROOT, 'tests/fixtures/colour/tokens.css');
const REFS = ['strategies', 'material', 'harmony', 'oklch', 'themes', 'measures', 'meaning', 'sources'];

const run = (...args) => spawnSync('python3', [SCRIPT, ...args], { encoding: 'utf8' });
const json = (...args) => {
  const result = run(...args, '--json');
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
};
const css = (text) => {
  const file = join(mkdtempSync(join(tmpdir(), 'colour-')), 'tokens.css');
  writeFileSync(file, text);
  return file;
};
const theme = (report, id) => report.themes.find((t) => t.id === id);
const pair = (t, text, ground) => t.pairs.find((p) => p.text === text && p.ground === ground);
const near = (actual, expected, at = 0.001) => assert.ok(Math.abs(actual - expected) <= at, `${actual} is not ${expected}`);

function png(width, rows) {
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const size = Buffer.alloc(4);
    size.writeUInt32BE(data.length);
    const sum = Buffer.alloc(4);
    sum.writeUInt32BE(crc32(body));
    return Buffer.concat([size, body, sum]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(rows.length, 4);
  header[8] = 8;
  header[9] = 2;
  const raw = Buffer.concat(rows.map((row) => Buffer.from([0, ...row.flat()])));
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([signature, chunk('IHDR', header), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

test('palette reads themes, aliases, OKLCH and alpha from tokens.css', () => {
  const report = json('palette', FIXTURE);
  assert.deepEqual(report.themes.map((t) => t.id), ['default', 'dark']);
  const light = theme(report, 'default');
  const hex = Object.fromEntries(light.colours.map((c) => [c.name, c.hex]));
  assert.equal(hex['--foreground'], '#111111');
  assert.equal(hex['--card'], '#f5f5f5');
  assert.equal(hex['--secondary'], '#e6e6e6');
  assert.equal(hex['--primary'], '#0b5fff', 'a P3 override is not the base value');
  assert.ok(!('--font-weight' in hex), '400 is not a colour');
  assert.ok(!('--space-1' in hex));
  assert.ok(!report.themes.some((t) => t.id === 'inline'));
});

test('palette measures the pairs the shadcn names declare', () => {
  const light = theme(json('palette', FIXTURE), 'default');
  near(pair(light, '--foreground', '--background').ratio, 18.883);
  assert.equal(pair(light, '--primary-foreground', '--primary').meets, true);
  near(pair(light, '--secondary-foreground', '--secondary').ratio, 15.13);
  near(pair(light, '--muted-foreground', '--background').ratio, 4.478);
  assert.equal(pair(light, '--muted-foreground', '--background').meets, false, '4.478 is not rounded up');
  near(pair(light, '--muted-foreground', '--muted').ratio, 4.0);
  near(pair(light, '--muted-foreground', '--card').ratio, 4.107);
  const ring = pair(light, '--ring', '--background');
  assert.equal(ring.threshold, 3);
  assert.equal(ring.sc, '1.4.11');
});

test('a theme inherits what it does not redefine', () => {
  const dark = theme(json('palette', FIXTURE, '--theme', 'dark'), 'dark');
  near(pair(dark, '--foreground', '--background').ratio, 17.32);
  near(pair(dark, '--muted-foreground', '--background').ratio, 7.486);
  near(pair(dark, '--ring', '--background').ratio, 3.682);
});

test('palette names what it cannot measure, never guesses', () => {
  const light = theme(json('palette', FIXTURE), 'default');
  assert.equal(light.not_measured.tokens['--accent'], 'rgb(10 20 30)');
  assert.deepEqual(light.not_measured.pairs, [{ text: '--accent-foreground', ground: '--accent' }]);
  assert.match(run('palette', FIXTURE).stdout, /not measured/i);
  const named = theme(json('palette', css(':root { --background: white; --foreground: #111; }')), 'default');
  assert.deepEqual(named.not_measured.pairs, [{ text: '--foreground', ground: '--background' }]);
});

test('palette compares states under colour-vision deficiency, with no verdict', () => {
  const light = theme(json('palette', FIXTURE), 'default');
  assert.equal(light.cvd.pairs.length, 1);
  assert.deepEqual(light.cvd.pairs[0].names, ['--destructive', '--success']);
  assert.ok(!('meets' in light.cvd.pairs[0]));
});

test('palette reads the usual ways to declare a theme', () => {
  const media = json('palette', css(':root { --background: #fff; --foreground: #111; } @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --background: #111; --foreground: #eee; } }'));
  assert.deepEqual(media.themes.map((t) => t.id), ['default', 'dark']);
  const data = json('palette', css(':root { --background: #fff; --foreground: #111; } :root[data-theme="night"] { --background: #000; }'));
  assert.deepEqual(data.themes.map((t) => t.id), ['default', 'night']);
  assert.equal(pair(theme(data, 'night'), '--foreground', '--background').ground_hex, '#000000');
});

test('palette refuses what it cannot read', () => {
  for (const [file, message] of [
    [join(tmpdir(), 'no-such-tokens.css'), /cannot read/],
    [css(':root { --space: 1rem; }'), /no colour token/],
    [css(':root { --background: #fff; '), /braces/],
    [css(':root { --background: #fff; --foreground: var(--nope); }'), /unknown var/],
    [css(':root { --ink: #111; --background: var(--foreground); --foreground: var(--background); }'), /circular var/],
  ]) {
    const result = run('palette', file);
    assert.equal(result.status, 1, file);
    assert.match(result.stderr, /^colour: /);
    assert.match(result.stderr, message);
  }
  assert.equal(run('palette', FIXTURE, '--theme', 'nope').status, 1);
});

test('a failing pair is a result, not an error', () => {
  const result = run('palette', FIXTURE);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /FAIL/);
});

test('dominant --match reads tokens.css', () => {
  const file = join(mkdtempSync(join(tmpdir(), 'colour-')), 'page.png');
  writeFileSync(file, png(2, [[[0x0b, 0x5f, 0xff], [0x11, 0x11, 0x11]]]));
  const { match } = json('dominant', file, '--match', FIXTURE, '--theme', 'default');
  const blue = match.tokens.find((t) => t.names.includes('--primary'));
  assert.equal(blue.hex, '#0b5fff');
  near(blue.share, 0.5);
});

test('harmony gives the schemes at the same lightness and share of chroma', () => {
  const result = json('harmony', 'oklch(0.6 0.12 250)');
  assert.deepEqual(result.schemes.map((s) => s.name), ['analogous', 'complementary', 'split-complementary', 'triadic']);
  const hues = Object.fromEntries(result.schemes.map((s) => [s.name, s.candidates.map((c) => Math.round(c.oklch[2]))]));
  assert.deepEqual(hues, { analogous: [220, 280], complementary: [70], 'split-complementary': [100, 40], triadic: [130, 10] });
  for (const c of result.schemes.flatMap((s) => s.candidates)) {
    near(c.oklch[0], 0.6);
    near(c.oklch[1] / c.max_chroma, result.share, 0.01);
    assert.match(c.hex, /^#[0-9a-f]{6}$/);
  }
});

test('harmony stays in sRGB for a colour at the edge of the gamut', () => {
  const result = json('harmony', '#ff0000');
  assert.ok(result.share > 0.95);
  for (const c of result.schemes.flatMap((s) => s.candidates)) assert.ok(c.oklch[1] <= c.max_chroma + 1e-9);
});

test('harmony refuses a grey and points to ramp', () => {
  for (const grey of ['#808080', '#ffffff', '#000000', 'oklch(1 0.1 30)']) {
    const result = run('harmony', grey);
    assert.equal(result.status, 1, grey);
    assert.match(result.stderr, /^colour: .*ramp/);
  }
  assert.equal(run('harmony', 'nope').status, 1);
});

const read = (file) => readFileSync(join(DIR, file), 'utf8');
const files = () => ['SKILL.md', ...REFS.map((name) => `references/${name}.md`)];
const cells = (line) => line.trim().slice(1, -1).split('|').map((cell) => cell.trim());
const rules = () => files().flatMap((file) => {
  const lines = read(file).split('\n');
  return lines.flatMap((line, i) => {
    if (line.trim() !== '| Rule | Why | Kind | Source | Checked by |') return [];
    const rows = [];
    for (let j = i + 2; lines[j]?.startsWith('|'); j++) rows.push({ at: `${file}:${j + 1}`, cells: cells(lines[j]) });
    return rows;
  });
});
const idOf = (row) => row.cells[0].match(/^`([a-z]+-\d+)` · \S/)?.[1];
const keys = () => [...read('references/sources.md').matchAll(/^- \*\*(.+?)\*\*/gm)].map((m) => m[1]);
const measures = () => new Set([...readFileSync(join(ROOT, 'skills/studio/scripts/check.js'), 'utf8').split('\nasync')[0].matchAll(/\(([a-z-]+)\)/g)].map((m) => m[1]));

test('SKILL.md is the colour skill, short, and names every reference', () => {
  const skill = read('SKILL.md');
  assert.match(skill, /^---\nname: colour\n/);
  const lines = skill.trimEnd().split('\n').length;
  assert.ok(lines <= 150, `SKILL.md has ${lines} lines`);
  for (const name of REFS) {
    assert.ok(existsSync(join(DIR, `references/${name}.md`)), `${name}.md is missing`);
    assert.ok(skill.includes(`references/${name}.md`), `SKILL.md does not name ${name}.md`);
  }
  assert.deepEqual(readdirSync(join(DIR, 'references')).sort(), REFS.map((name) => `${name}.md`).sort());
});

test('every colour rule follows the format', () => {
  const all = rules();
  assert.ok(all.length >= 20, `${all.length} rules`);
  const sources = new Set(keys());
  const known = measures();
  const seen = new Set();
  const kind = /^(standard \(WCAG \d\.\d+\.\d+(, \d\.\d+\.\d+)*\)|empirical finding|heuristic)$/;
  const one = 'script [a-z-]+|colour (?:palette|cvd|contrast|harmony|dominant)|critic phases? [234](?:, [234])*';
  const check = new RegExp(`^(?:${one})(?: \\+ (?:${one}))*(?: · blocking)?$`);
  for (const row of all) {
    assert.equal(row.cells.length, 5, `${row.at}: ${row.cells.length} columns`);
    const [, why, type, source, checked] = row.cells;
    const id = idOf(row);
    assert.match(id ?? '', /^(material|strategy|gesture|harmony|roles|proof)-\d+$/, `${row.at}: bad id`);
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

test('the colour blocking core is exactly the agreed rules, plus the standards', () => {
  const blocking = rules().filter((row) => row.cells[4].endsWith(' · blocking') && !row.cells[2].startsWith('standard')).map(idOf).sort();
  assert.deepEqual(blocking, ['gesture-1', 'material-1', 'strategy-1']);
  const standards = rules().filter((row) => row.cells[2].startsWith('standard')).map(idOf);
  for (const id of ['proof-1', 'proof-2', 'proof-3']) assert.ok(standards.includes(id), `${id} is not a standard`);
});

test('every colour source states its licence and is credited', () => {
  const lines = read('references/sources.md').split('\n').filter((line) => line.startsWith('- **'));
  assert.ok(lines.length >= 15, `${lines.length} sources`);
  for (const line of lines) assert.match(line, /Licence: \S/, line);
  const credits = new Set(readFileSync(join(ROOT, 'CREDITS.md'), 'utf8').split('\n').filter((line) => line.startsWith('|')).map((line) => cells(line)[0]));
  for (const key of keys()) assert.ok(credits.has(key), `CREDITS.md has no row "${key}"`);
});

test('nothing is left of the v0.3 colour skill', () => {
  for (const file of files()) {
    assert.doesNotMatch(read(file), /charter|tokens\.json|01-context|08-colour|art director|\bA1\b|\bB2\b/i, file);
  }
});
