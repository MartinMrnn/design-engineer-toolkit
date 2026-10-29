// checks.js · automated checks on the page currently open, for the critic and the frontend developer.
// Usage: open the page with browser_navigate, then call browser_run_code_unsafe
// with { "filename": "design/reviews/scripts/checks.js" }. The studio copies this
// file into each project at kickoff and fills in the output folder.
//
// At 1440 × 900 and 390 × 844 it reports:
// - with motion: console errors (with the failing URL), horizontal scrolling or text cut off at the
//   edge, images that fail to load (lazy ones included), links to nothing (empty, "#", "javascript:");
// - with reduced motion: text left invisible, and every violation of the axe-core rules tagged WCAG
//   level A or AA (2.0, 2.1 and 2.2: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa; never AAA or best
//   practice), whatever its impact, with its success criteria and level, measured on the final state
//   with every reveal shown. target-size (2.5.8, AA) is off by default in axe: it is turned on here.
// - under `review` (not issues): what axe could not decide (its "incomplete" results, such as text
//   over an image) and the findings of rules axe marks experimental. A person checks them.
// It does not see: text hidden by masks or clip-path, links to pages that do not exist, CSS
// background images, hover and focus states, keyboard use, or any viewport other than these two.
// A page that passes has no violation of these rules only: it is not proof of WCAG conformance.
async (page) => {
  const OUT = '__OUT__';
  const AXE = 'https://cdn.jsdelivr.net/npm/axe-core@4.14.0/axe.min.js';
  const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
  const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
  const IMAGE_TIMEOUT = 10000;
  const url = page.url().split('#')[0];
  const slug = (new URL(url).pathname.replace(/^\/+|\.html?$/g, '').replace(/[^a-z0-9]+/gi, '-') || 'index').toLowerCase();
  const found = [];
  const review = [];
  const files = [];

  const open = async (size, reducedMotion) => {
    await page.emulateMedia({ reducedMotion });
    await page.setViewportSize(size);
    await page.goto(url);
    await page.waitForLoadState('load');
    await page.evaluate(() => document.fonts && document.fonts.ready.then(() => true));
    await page.waitForTimeout(1200);
  };

  for (const [viewport, size] of Object.entries(VIEWPORTS)) {
    // With motion: what a visitor meets.
    const errors = [];
    const onConsole = (message) => {
      if (message.type() !== 'error') return;
      const source = message.location().url || '';
      // Browsers request /favicon.ico even when the page declares no icon.
      if (/\/favicon\.ico([?#]|$)/.test(source)) return;
      errors.push(source && !message.text().includes(source) ? `${message.text()} · ${source}` : message.text());
    };
    const onPageError = (error) => errors.push(error.message);
    page.on('console', onConsole);
    page.on('pageerror', onPageError);
    await open(size, 'no-preference');
    // Lazy images below the first screen are only requested when scrolled to: request them all now.
    await page.evaluate(() => {
      for (const img of document.images) {
        if (img.loading === 'lazy') img.loading = 'eager';
      }
    });
    await page.waitForFunction(() => [...document.images].every((img) => img.complete), null, { timeout: IMAGE_TIMEOUT }).catch(() => {});
    const state = await page.evaluate(() => {
      const width = document.documentElement.scrollWidth;
      const wide = width > window.innerWidth + 1;
      const clipped = [document.documentElement, document.body].some((el) => el && /hidden|clip/.test(getComputedStyle(el).overflowX));
      // When the page clips its own overflow, the visitor cannot scroll sideways: only text crossing an edge matters.
      const cutOff = [];
      if (wide && clipped) {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node && cutOff.length < 3; node = walker.nextNode()) {
          if (!node.textContent.trim() || getComputedStyle(node.parentElement).visibility === 'hidden') continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          const crosses = [...range.getClientRects()].some((r) => r.width > 0
            && ((r.left < window.innerWidth && r.right > window.innerWidth + 1) || (r.left < -1 && r.right > 0)));
          if (crosses) cutOff.push(node.parentElement.textContent.trim().replace(/\s+/g, ' ').slice(0, 60));
        }
      }
      const images = [...document.images].map((img) => ({
        src: img.getAttribute('src') || img.currentSrc,
        broken: img.complete && img.naturalWidth === 0,
        pending: !img.complete,
      }));
      const emptyLinks = [...document.querySelectorAll('a')]
        .filter((a) => {
          const href = (a.getAttribute('href') || '').trim();
          return href === '' || href === '#' || href.startsWith('javascript:');
        })
        .map((a) => a.textContent.trim().slice(0, 60) || a.outerHTML.slice(0, 60));
      return { width, scrolls: wide && !clipped, cutOff, images, emptyLinks };
    });
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
    for (const detail of errors) found.push({ kind: 'console', viewport, detail });
    if (state.scrolls) found.push({ kind: 'overflow', viewport, detail: `the page scrolls sideways: ${state.width}px wide at ${size.width}px` });
    for (const text of state.cutOff) found.push({ kind: 'overflow', viewport, detail: `text cut off at the edge: ${text}` });
    for (const img of state.images) {
      if (img.broken) found.push({ kind: 'broken-image', viewport, detail: img.src });
      if (img.pending) found.push({ kind: 'broken-image', viewport, detail: `${img.src} (still loading after ${IMAGE_TIMEOUT / 1000} s)` });
    }
    for (const text of state.emptyLinks) found.push({ kind: 'empty-link', viewport, detail: text });

    // With reduced motion: the final state, which must show every piece of content.
    await open(size, 'reduce');
    const hidden = await page.evaluate(() => {
      const INTENDED = '[aria-hidden="true"], [hidden], dialog:not([open]), template, noscript, script, style';
      const BLOCKS = 'h1, h2, h3, h4, h5, h6, p, li, a, button, label, figcaption, blockquote, dt, dd, td, th';
      // Hidden on purpose: display:none, aria-hidden, [hidden], a closed dialog, visibility:hidden from a
      // stylesheet, or transparent and not clickable (a closed dropdown). Left hidden: opacity under 0.1
      // along the ancestors, or GSAP's autoAlpha (visibility:hidden and opacity 0, written inline).
      const invisible = (el) => {
        if (getComputedStyle(el).visibility === 'hidden') {
          let origin = el;
          while (origin.parentElement && getComputedStyle(origin.parentElement).visibility === 'hidden') origin = origin.parentElement;
          if (!(origin.style.visibility === 'hidden' && Number(getComputedStyle(origin).opacity) < 0.1)) return false;
        }
        let opacity = 1;
        for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
          if (node.matches(INTENDED)) return false;
          const style = getComputedStyle(node);
          if (style.display === 'none') return false;
          if (Number(style.opacity) < 0.1 && style.pointerEvents === 'none') return false;
          opacity *= Number(style.opacity);
        }
        return opacity < 0.1 || getComputedStyle(el).visibility === 'hidden';
      };
      const seen = new Set();
      const texts = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const parent = node.parentElement;
        if (!parent || !node.textContent.trim()) continue;
        const block = parent.closest(BLOCKS) || parent;
        if (seen.has(block) || !invisible(parent)) continue;
        seen.add(block);
        texts.push(block.textContent.trim().replace(/\s+/g, ' ').slice(0, 60));
      }
      return texts;
    });
    for (const text of hidden) found.push({ kind: 'hidden-under-reduced-motion', viewport, detail: text });

    try {
      await page.addScriptTag({ url: AXE });
      const result = await page.evaluate(async (tags) => {
        const r = await window.axe.run(document, { runOnly: { type: 'tag', values: tags }, rules: { 'target-size': { enabled: true } } });
        // wcag258 is SC 2.5.8, wcag1412 is SC 1.4.12; wcag2a and wcag21a are level A, wcag2aa to wcag22aa level AA.
        const criteria = (ruleTags) => ruleTags.map((t) => /^wcag(\d)(\d)(\d+)$/.exec(t)).filter(Boolean).map((m) => `${m[1]}.${m[2]}.${m[3]}`);
        const level = (ruleTags) => (ruleTags.some((t) => /^wcag2\d?aa$/.test(t)) ? 'AA' : 'A');
        const item = (v) => ({
          rule: v.id, sc: criteria(v.tags).join(', '), level: level(v.tags), impact: v.impact || 'unknown',
          experimental: v.tags.includes('experimental'), help: v.help,
          targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
        });
        return { violations: r.violations.map(item), incomplete: r.incomplete.map(item) };
      }, AXE_TAGS);
      const line = (v) => `SC ${v.sc} (level ${v.level}) · ${v.impact}: ${v.help} (${v.targets.join(', ')})`;
      for (const v of result.violations) {
        const entry = { kind: 'accessibility', viewport, rule: v.rule, sc: v.sc, level: v.level, impact: v.impact, detail: line(v) };
        if (v.experimental) review.push({ ...entry, kind: 'needs-review', why: 'experimental rule' });
        else found.push(entry);
      }
      for (const v of result.incomplete) {
        review.push({ kind: 'needs-review', viewport, rule: v.rule, sc: v.sc, level: v.level, impact: v.impact, why: 'axe could not decide', detail: line(v) });
      }
    } catch (error) {
      found.push({ kind: 'check-failed', viewport, detail: `accessibility checks could not run: ${error.message}` });
    }

    const shot = `${OUT}/${slug}-${viewport}-reduced-motion.png`;
    await page.screenshot({ path: shot });
    files.push(shot);
  }

  // Leave the page as a visitor sees it, reloaded so that scripts which read
  // prefers-reduced-motion once at load take their normal path again.
  await page.emulateMedia({ reducedMotion: null });
  await page.setViewportSize(VIEWPORTS.desktop);
  await page.goto(url);
  await page.waitForLoadState('load');

  // The same problem at both widths is reported once.
  const merge = (list) => {
    const out = [];
    for (const issue of list) {
      const same = out.find((i) => i.kind === issue.kind && i.rule === issue.rule && i.detail === issue.detail);
      if (same) same.viewport = `${same.viewport}, ${issue.viewport}`;
      else out.push(issue);
    }
    return out;
  };
  const issues = merge(found);
  // `pass` covers the issues only; the review items wait for a person.
  return { url, pass: issues.length === 0, issues, review: merge(review), files };
}
