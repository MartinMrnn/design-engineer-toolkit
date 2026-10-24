// checks.js · automated checks on the page currently open, for the critic and the frontend developer.
// Usage: open the page with browser_navigate, then call browser_run_code_unsafe
// with { "filename": "design/reviews/scripts/checks.js" }. The studio copies this
// file into each project at kickoff and fills in the output folder.
//
// At 1440 × 900 and 390 × 844 it reports:
// - with motion: console errors (with the failing URL), horizontal scrolling or text cut off at the
//   edge, images that fail to load (lazy ones included), links to nothing (empty, "#", "javascript:");
// - with reduced motion: text left invisible, and axe-core WCAG 2 A/AA serious or critical
//   violations, measured on the final state with every reveal shown.
// It does not see: text hidden by masks or clip-path, contrast of text over images or gradients
// (axe only flags those for manual review), links to pages that do not exist, CSS background
// images, hover and focus states, or any viewport other than these two.
async (page) => {
  const OUT = '__OUT__';
  const AXE = 'https://cdn.jsdelivr.net/npm/axe-core@4.14.0/axe.min.js';
  const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
  const IMAGE_TIMEOUT = 10000;
  const url = page.url().split('#')[0];
  const slug = (new URL(url).pathname.replace(/^\/+|\.html?$/g, '').replace(/[^a-z0-9]+/gi, '-') || 'index').toLowerCase();
  const found = [];
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
      const violations = await page.evaluate(async () => {
        const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
        return result.violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .map((v) => ({ rule: v.id, impact: v.impact, help: v.help, targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
      });
      for (const v of violations) {
        found.push({ kind: 'accessibility', viewport, rule: v.rule, detail: `${v.impact}: ${v.help} (${v.targets.join(', ')})` });
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
  const issues = [];
  for (const issue of found) {
    const same = issues.find((i) => i.kind === issue.kind && i.rule === issue.rule && i.detail === issue.detail);
    if (same) same.viewport = `${same.viewport}, ${issue.viewport}`;
    else issues.push(issue);
  }
  return { url, pass: issues.length === 0, issues, files };
}
