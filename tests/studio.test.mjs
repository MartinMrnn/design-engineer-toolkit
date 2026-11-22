import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './harness.mjs';

const DIR = join(ROOT, 'skills/studio');
const skill = () => readFileSync(join(DIR, 'SKILL.md'), 'utf8');

test('the studio skill is named studio and stays within 150 lines', () => {
  const text = skill();
  assert.match(text, /^---\nname: studio\n/);
  const lines = text.trimEnd().split('\n').length;
  assert.ok(lines <= 150, `SKILL.md has ${lines} lines`);
});

test('every references/ or scripts/ file the studio cites exists', () => {
  const refs = join(DIR, 'references');
  const texts = [skill(), ...readdirSync(refs).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(refs, f), 'utf8'))];
  const cited = new Set(texts.flatMap((t) => [...t.matchAll(/\b(?:references|scripts)\/[\w.-]+\.\w+/g)].map((m) => m[0])));
  assert.ok(cited.size > 0, 'no file cited');
  assert.deepEqual([...cited].filter((p) => !existsSync(join(DIR, p))), []);
});
