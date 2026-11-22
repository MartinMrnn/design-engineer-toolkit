import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './harness.mjs';

test('the researcher is a Sonnet agent that writes its board but cannot edit', () => {
  const text = readFileSync(join(ROOT, 'agents/researcher.md'), 'utf8');
  const front = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? '';
  assert.match(front, /^name: researcher$/m);
  assert.match(front, /^model: sonnet$/m);
  const disallowed = front.match(/^disallowedTools: (.+)$/m)?.[1].split(/,\s*/) ?? [];
  for (const tool of ['Edit', 'NotebookEdit']) assert.ok(disallowed.includes(tool), `${tool} is not disallowed`);
  assert.ok(!disallowed.includes('Write'), 'Write is needed for board.md');
});
