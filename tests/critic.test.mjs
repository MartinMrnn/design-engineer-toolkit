import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, serve, runScript } from './harness.mjs';

const agent = () => readFileSync(join(ROOT, 'agents/critic.md'), 'utf8');

test('the critic is an Opus agent that cannot edit the work', () => {
  const front = agent().match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? '';
  assert.match(front, /^name: critic$/m);
  assert.match(front, /^model: opus$/m);
  const disallowed = front.match(/^disallowedTools: (.+)$/m)?.[1].split(/,\s*/) ?? [];
  for (const tool of ['Edit', 'Write', 'NotebookEdit']) assert.ok(disallowed.includes(tool), `${tool} is not disallowed`);
});

test('every plugin file the critic cites exists', () => {
  const cited = [...agent().matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([\w./<>-]+)/g)].map((m) => m[1]);
  assert.ok(cited.length > 0, 'no file cited');
  const paths = cited.flatMap((p) => (p.includes('<n>') ? [1, 2, 3, 4].map((n) => p.replace('<n>', n)) : [p]));
  assert.deepEqual(paths.filter((p) => !existsSync(join(ROOT, p))), []);
});

// The fixture is a phase-3 key page that the check script passes but the critic must not:
// an invented phone number, a hero title that departs from content.md, the "Honoraires"
// section missing, white text on a light gradient. These notes stay here, out of the critic's sight.
test('the faulty fixture passes check.js: its defects are left to the critic', async () => {
  const server = await serve(join(ROOT, 'tests/fixtures/critic'));
  try {
    const report = await runScript('check.js', `${server.url}/design/maquette/accueil.html`);
    assert.deepEqual(report.issues, [], JSON.stringify(report.issues, null, 1));
    assert.equal(report.pass, true);
  } finally {
    await server.close();
  }
});
