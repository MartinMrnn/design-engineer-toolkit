import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ROOT, serve, runScript, read } from './harness.mjs';

let server;

before(async () => {
  server = await serve(join(ROOT, 'tests/fixtures'));
});

after(() => server.close());

const check = (page, options) => runScript('check.js', `${server.url}/${page}`, options);
const details = (report, kind) => report.issues.filter((i) => i.kind === kind).map((i) => i.detail);
const show = (report) => JSON.stringify(report.issues, null, 1);
const motionState = (page) => page.evaluate(() => ({
  reduceAtLoad: window.reduceAtLoad,
  reduceNow: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
}));

test('check.js fits the MCP sandbox', async () => {
  const source = await read('check.js');
  assert.doesNotMatch(source, /\bprocess\.|\brequire\(|^\s*import\s/m, 'Node globals are not available in the MCP sandbox');
  assert.doesNotMatch(source, /__OUT__/, 'check.js writes no file');
  assert.match(source.trim().replace(/^(\/\/.*\n)+/, ''), /^async \(page\) =>/);
});

// Each run loads its page about twenty times: run four at once.
describe('check.js', { concurrency: 4 }, () => {
  test('passes a clean page in both its themes', async () => {
    const report = await check('good.html');
    assert.deepEqual(report.issues, [], show(report));
    assert.equal(report.pass, true);
    assert.deepEqual(report.themes, ['light', 'dark']);
  });

  test('measures every theme the CSS declares, at the five widths', async () => {
    const report = await check('themes.html');
    assert.deepEqual(report.themes, ['light', 'dark', 'sepia']);
    const contrast = (name) => report.issues.find((i) => i.kind === 'axe' && i.rule === 'color-contrast' && i.detail.includes(name));
    for (const [name, theme] of [['night', 'dark'], ['sepia', 'sepia']]) {
      const issue = contrast(name);
      assert.ok(issue, `${name}: ${show(report)}`);
      assert.deepEqual(issue.at.split(', '), ['320', '390', '768', '1024', '1440'].map((w) => `${w} ${theme}`));
    }
  });

  test('flags every v0.3 defect of a broken page', async () => {
    const report = await check('bad.html');
    assert.equal(report.pass, false);
    const kinds = new Set(report.issues.map((i) => i.kind));
    for (const kind of ['reflow', 'console', 'broken-image', 'empty-link', 'axe', 'hidden-under-reduced-motion']) {
      assert.ok(kinds.has(kind), `missing ${kind}`);
    }
    assert.ok(report.issues.some((i) => i.kind === 'axe' && i.rule === 'color-contrast'));
    // The 900 px block makes the page scroll up to 768 px, not at 1024 or 1440.
    assert.deepEqual(report.issues.filter((i) => i.kind === 'reflow').map((i) => i.at), ['320, 390, 768']);
    // The paragraph is hidden only when its animation does not run: this needs the reduced-motion emulation.
    assert.deepEqual(details(report, 'hidden-under-reduced-motion'), ['This paragraph never shows up.']);
    assert.ok(details(report, 'console').some((d) => d.endsWith('/missing.png')), 'a failed request must name its URL');
  });

  test('finds each misstep of the v1 measures', async () => {
    const report = await check('missteps.html');
    assert.deepEqual(details(report, 'text-overflow'), ['spills out: Reservations'], show(report));
    assert.deepEqual(details(report, 'overlap'), ['span.logo "Studio Logo" overlaps a.menu "Menu"'], show(report));
    assert.deepEqual(details(report, 'input-size'), ['input#q.small: 12px'], show(report));
    assert.ok(report.issues.some((i) => i.kind === 'axe' && i.rule === 'target-size'), show(report));
    assert.deepEqual(details(report, 'keyboard'), [
      'looks clickable but cannot be focused: div.card "Open the card"',
      'never reached with Tab: a "Hidden from the keyboard"',
    ], show(report));
    assert.deepEqual(details(report, 'focus-visible'), ['button.bare "No focus ring"'], show(report));
    assert.deepEqual(details(report, 'placeholder'), ['Lorem ipsum dolor sit amet.', 'Phone: [à fournir]'], show(report));
    assert.deepEqual(details(report, 'reduced-motion'), ['div.spinner'], show(report));
    assert.deepEqual(details(report, 'transition-duration'), ['a.slow "Slow hover": color 600 ms'], show(report));
    assert.deepEqual(details(report, 'token'), ['<style> .hard { color: rgb(176, 0, 32) }'], show(report));
  });

  test('passes a slow intro, reveals and a page without an icon, and leaves it in its normal state', async () => {
    const report = await check('motion.html', { after: motionState });
    assert.deepEqual(report.issues, [], 'an intro still fading in or the browser asking for /favicon.ico is not a defect');
    assert.deepEqual(report.after, { reduceAtLoad: false, reduceNow: false }, 'the page must end reloaded without reduced motion');
  });

  test('checks the contrast of text revealed below the first screen', async () => {
    const report = await check('reveal-contrast.html');
    assert.ok(report.issues.some((i) => i.kind === 'axe' && i.rule === 'color-contrast'), show(report));
    assert.deepEqual(details(report, 'hidden-under-reduced-motion'), []);
  });

  test('finds text left hidden by split words and autoAlpha, not text hidden on purpose', async () => {
    const report = await check('hidden-patterns.html');
    assert.deepEqual(details(report, 'hidden-under-reduced-motion'), ['Split heading', 'Waiting for autoAlpha']);
  });

  test('finds a broken lazy image below the first screen', async () => {
    const report = await check('lazy.html');
    assert.deepEqual(details(report, 'broken-image'), ['missing-lazy.png']);
  });

  test('reports clipped text, not clipped decoration', async () => {
    const decoration = await check('clipped.html?decoration-only');
    assert.deepEqual(decoration.issues, [], 'clipped decoration is not a defect');
    const cut = await check('clipped.html');
    assert.equal(cut.issues.length, 1, show(cut));
    assert.equal(cut.issues[0].kind, 'text-overflow');
    assert.match(cut.issues[0].detail, /^cut off: This sentence never wraps/);
    const widths = cut.issues[0].at.split(', ');
    assert.ok(widths.includes('320') && widths.includes('390') && !widths.includes('1024') && !widths.includes('1440'), cut.issues[0].at);
  });

  test('reports nothing on a page that scrolls inside a container', async () => {
    const report = await check('container.html');
    assert.deepEqual(report.issues, [], show(report));
  });
});
