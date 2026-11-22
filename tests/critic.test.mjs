import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ROOT, serve, runScript } from './harness.mjs';

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
