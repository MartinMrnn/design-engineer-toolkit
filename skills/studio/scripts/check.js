// check.js · every measurable misstep of the page currently open (design-studio v1, criterion C2).
// Usage: open the page with browser_navigate, then call browser_run_code_unsafe with
// { "filename": "<path to>/check.js" }. It returns { url, pass, themes, issues: [{ kind, at, rule?, detail }] }:
// `kind` is the measure's id, cited by the skills' "Checked by" column; `at` says where it was seen.
//
// At 320, 390, 768, 1024 and 1440 px, in every theme the page's CSS declares (prefers-color-scheme: dark,
// a color-scheme with dark, [data-theme="…"]), it loads the page twice:
// - with motion: console errors (console), images that fail to load, lazy ones included (broken-image),
//   links to nothing (empty-link), sideways scrolling (reflow), transitions over 300 ms on what a visitor
//   hovers, presses or opens (transition-duration);
// - with reduced motion, the final state: text left invisible (hidden-under-reduced-motion), boxes still
//   moving (reduced-motion), axe-core WCAG 2.2 A/AA serious or critical violations, targets under 24 px
//   included (axe), text spilling out of its box or cut by a parent (text-overflow), text and controls on
//   top of each other (overlap), inputs under 16 px (input-size), clickable things a keyboard cannot reach
//   (keyboard), focus that changes nothing on screen (focus-visible), lorem, [à fournir] or TODO
//   (placeholder) and, when the page links a tokens.css, colours, radii and spacing written by hand (token).
// It does not see: contrast over images or gradients, scroll-driven animations, menus or dialogs once
// opened, the contrast of the focus indicator, CSS background images, links to pages that do not exist.
async (page) => {
  const AXE = 'https://cdn.jsdelivr.net/npm/axe-core@4.14.0/axe.min.js';
  const WIDTHS = [[320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 900]];
  const IMAGE_TIMEOUT = 10000;
  const MAX_PER_KIND = 10;
  const url = page.url().split('#')[0];
  const found = [];

  // Shared by the measures below; installed in the page after each load.
  const install = () => {
    const FOCUSABLE = 'a[href], area[href], button, input:not([type="hidden"]), select, textarea, summary, iframe, [contenteditable=""], [contenteditable="true"], [tabindex]:not([tabindex^="-"])';
    const TARGETS = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex]:not([tabindex^="-"]), [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="checkbox"], [role="switch"]';
    const LOOK = ['outline-style', 'outline-width', 'outline-color', 'box-shadow', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'background-color', 'color', 'text-decoration-line', 'opacity', 'transform'];
    const short = (text) => text.trim().replace(/\s+/g, ' ').slice(0, 60);
    const visible = (el) => {
      const box = el.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    };
    const describe = (el) => {
      const classes = typeof el.className === 'string' ? el.className.split(/\s+/).filter(Boolean) : [];
      const label = short(el.textContent || el.getAttribute('aria-label') || el.getAttribute('alt') || el.getAttribute('placeholder') || '').slice(0, 40);
      return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${classes.map((name) => `.${name}`).join('')}${label ? ` "${label}"` : ''}`;
    };
    // What focus can change: the element's box and look, its parent's, its children's, its pseudo-elements'.
    const look = (el) => {
      const box = el.getBoundingClientRect();
      const styles = [el, el.parentElement, ...[...el.querySelectorAll('*')].slice(0, 20)].filter(Boolean).map((node) => getComputedStyle(node));
      styles.push(getComputedStyle(el, '::before'), getComputedStyle(el, '::after'));
      return [box.width, box.height, box.left + scrollX, box.top + scrollY].map(Math.round).join()
        + styles.map((style) => style.content + LOOK.map((name) => style.getPropertyValue(name)).join()).join('|');
    };
    window.__check = { FOCUSABLE, TARGETS, short, visible, describe, look };
  };

  const open = async ([width, height], reducedMotion, theme) => {
    await page.emulateMedia({ reducedMotion, colorScheme: theme.scheme });
    await page.setViewportSize({ width, height });
    await page.goto(url);
    await page.waitForLoadState('load');
    if (theme.attr) await page.evaluate((name) => document.documentElement.setAttribute('data-theme', name), theme.attr);
    await page.evaluate(() => document.fonts && document.fonts.ready.then(() => true));
    await page.waitForTimeout(1200);
    await page.evaluate(install);
  };

  // With motion: sideways scrolling, images, empty links, slow interface transitions.
  const withMotion = () => {
    const c = window.__check;
    const width = document.documentElement.scrollWidth;
    // When the page clips its own overflow, the visitor cannot scroll sideways.
    const clipped = [document.documentElement, document.body].some((el) => el && /hidden|clip/.test(getComputedStyle(el).overflowX));
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
    // What a visitor hovers, presses or opens: controls and what they hold, overlays, what aria-controls points to.
    const OVERLAYS = 'dialog, [popover], [role="dialog"], [role="menu"], [role="listbox"], [aria-modal="true"]';
    const ui = new Set(document.querySelectorAll(OVERLAYS));
    for (const el of document.querySelectorAll(c.TARGETS)) {
      ui.add(el);
      for (const child of el.querySelectorAll('*')) ui.add(child);
    }
    for (const el of document.querySelectorAll('[aria-controls]')) {
      for (const id of el.getAttribute('aria-controls').split(/\s+/)) {
        const target = document.getElementById(id);
        if (target) ui.add(target);
      }
    }
    const ms = (list) => list.split(',').map((s) => parseFloat(s) * 1000);
    const slow = [];
    for (const el of ui) {
      const style = getComputedStyle(el);
      const durations = ms(style.transitionDuration);
      const delays = ms(style.transitionDelay);
      let longest = { time: 0 };
      style.transitionProperty.split(',').forEach((name, i) => {
        // The duration and delay lists repeat to match the property list.
        const time = durations[i % durations.length] + delays[i % delays.length];
        if (name.trim() !== 'none' && time > longest.time) longest = { time, name: name.trim() };
      });
      if (longest.time > 300) slow.push(`${c.describe(el)}: ${longest.name} ${Math.round(longest.time)} ms`);
    }
    return { scrolls: width > window.innerWidth + 1 && !clipped, images, emptyLinks, slow };
  };

  // With reduced motion, text that never shows up.
  const hiddenText = () => {
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
  };

  // With reduced motion, boxes read twice half a second apart: what moved is still animating.
  const stillMoving = async () => {
    const c = window.__check;
    const elements = [...document.body.querySelectorAll('*')].filter(c.visible);
    const before = elements.map((el) => el.getBoundingClientRect());
    await new Promise((resolve) => setTimeout(resolve, 500));
    const moved = new Set(elements.filter((el, i) => {
      const a = before[i];
      const b = el.getBoundingClientRect();
      return Math.abs(a.x - b.x) > 1 || Math.abs(a.y - b.y) > 1 || Math.abs(a.width - b.width) > 1 || Math.abs(a.height - b.height) > 1;
    }));
    // Report what moves, not everything it carries along.
    return [...moved].filter((el) => !moved.has(el.parentElement)).map(c.describe);
  };

  // With reduced motion: text out of its box or on other text, small inputs, clickable things that cannot
  // be focused, placeholder text and, from phase 3, values written by hand instead of tokens.
  const layout = () => {
    const c = window.__check;
    const out = { 'text-overflow': [], overlap: [], 'input-size': [], keyboard: [], placeholder: [], token: [] };
    const isPlaceholder = (text) => /\blorem\b|\[à fournir\]/i.test(text) || /\bTODO\b/.test(text);
    const placeholders = new Set();
    const blockOf = (el) => {
      while (el.parentElement && ['inline', 'contents'].includes(getComputedStyle(el).display)) el = el.parentElement;
      return el;
    };

    const texts = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (!parent || !node.textContent.trim() || parent.closest('script, style, noscript, template, svg')) continue;
      if (isPlaceholder(node.textContent)) placeholders.add(c.short(blockOf(parent).textContent));
      if (!c.visible(parent)) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
      if (rects.length) texts.push({ node, block: blockOf(parent), rects });
    }

    // Text stays inside its own box and inside every parent that hides its overflow. For html and body the
    // viewport is what clips; a scrolling parent can bring text into view; a quarter line of vertical slack
    // covers tight leading. Text entirely outside a clipping parent is hidden on purpose (a carousel slide).
    const viewport = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
    const beyond = (box, axis) => (r) => (axis === 'x'
      ? r.left < box.left - 1 || r.right > box.right + 1
      : r.top < box.top - r.height / 4 || r.bottom > box.bottom + r.height / 4);
    const within = (box, axis) => (r) => (axis === 'x'
      ? r.right > box.left && r.left < box.right
      : r.bottom > box.top && r.top < box.bottom);
    const reported = new Set();
    for (const { block, rects } of texts) {
      if (reported.has(block)) continue;
      const style = getComputedStyle(block);
      if (style.textOverflow === 'ellipsis' || style.webkitLineClamp !== 'none') continue; // truncated on purpose
      const own = block.getBoundingClientRect();
      const spills = (style.overflowX === 'visible' && rects.some(beyond(own, 'x')))
        || (style.overflowY === 'visible' && rects.some(beyond(own, 'y')));
      let cut = false;
      let srOnly = false;
      const open = { x: true, y: true };
      for (let el = block; el && !srOnly; el = el.parentElement) {
        const s = getComputedStyle(el);
        const box = el === document.body || el === document.documentElement ? viewport : el.getBoundingClientRect();
        for (const axis of ['x', 'y']) {
          const overflow = axis === 'x' ? s.overflowX : s.overflowY;
          if (!open[axis] || overflow === 'visible') continue;
          if (overflow === 'auto' || overflow === 'scroll') open[axis] = false;
          else if (box.right - box.left < 2 || box.bottom - box.top < 2) srOnly = true; // text for screen readers
          else if (rects.some(beyond(box, axis)) && rects.some(within(box, axis))) cut = true;
        }
      }
      if (srOnly || !(cut || spills)) continue;
      reported.add(block);
      out['text-overflow'].push(`${cut ? 'cut off' : 'spills out'}: ${c.short(block.textContent)}`);
    }

    // Lines of text and controls that land on each other. Decorative text (aria-hidden) and images are left out.
    const items = [];
    for (const { node, block, rects } of texts) {
      if (node.parentElement.closest('[aria-hidden="true"]')) continue;
      for (const r of rects) items.push({ owner: block, r });
    }
    for (const el of document.querySelectorAll(c.TARGETS)) {
      if (c.visible(el) && !el.closest('[aria-hidden="true"]')) items.push({ owner: el, r: el.getBoundingClientRect() });
    }
    const overlaps = new Set();
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];
        if (a.owner.contains(b.owner) || b.owner.contains(a.owner)) continue;
        const width = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
        const height = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
        if (width <= 2 || height <= 0.3 * Math.min(a.r.height, b.r.height)) continue;
        const [first, second] = a.owner.compareDocumentPosition(b.owner) & Node.DOCUMENT_POSITION_FOLLOWING ? [a.owner, b.owner] : [b.owner, a.owner];
        overlaps.add(`${c.describe(first)} overlaps ${c.describe(second)}`);
      }
    }
    out.overlap = [...overlaps];

    // Text fields under 16 px: iOS zooms into them.
    const NOT_TEXT = '[type="checkbox"], [type="radio"], [type="range"], [type="color"], [type="file"], [type="button"], [type="submit"], [type="reset"], [type="image"], [type="hidden"]';
    for (const el of document.querySelectorAll('input, select, textarea')) {
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (!el.matches(NOT_TEXT) && c.visible(el) && size < 16) out['input-size'].push(`${c.describe(el)}: ${size}px`);
    }

    // A pointer cursor promises a click; nothing focusable in or around it means no keyboard can do it.
    for (const el of document.body.querySelectorAll('*')) {
      if (getComputedStyle(el).cursor !== 'pointer' || getComputedStyle(el.parentElement).cursor === 'pointer') continue;
      if (el.matches('label') || el.closest(c.FOCUSABLE) || el.querySelector(c.FOCUSABLE) || !c.visible(el)) continue;
      out.keyboard.push(`looks clickable but cannot be focused: ${c.describe(el)}`);
    }

    for (const el of document.querySelectorAll('[alt], [title], [aria-label], [placeholder], meta[name="description"]')) {
      for (const name of ['alt', 'title', 'aria-label', 'placeholder', 'content']) {
        const value = el.getAttribute(name);
        if (value && isPlaceholder(value)) placeholders.add(`${name}="${c.short(value)}"`);
      }
    }
    if (isPlaceholder(document.title)) placeholders.add(`title: ${c.short(document.title)}`);
    out.placeholder = [...placeholders];

    // Once a tokens.css is linked (phase 3 on), colours, radii and spacing come from var(); neutral values pass.
    const TOKENS = /\/tokens\.css([?#]|$)/;
    const sheets = [...document.styleSheets];
    if (sheets.some((sheet) => sheet.href && TOKENS.test(sheet.href))) {
      const PROPS = /^(color|background-color|border-(top|right|bottom|left|block-start|block-end|inline-start|inline-end)-color|outline-color|text-decoration-color|fill|stroke|border-(top-left|top-right|bottom-left|bottom-right|start-start|start-end|end-start|end-end)-radius|(margin|padding)-(top|right|bottom|left|block-start|block-end|inline-start|inline-end)|row-gap|column-gap)$/;
      const NEUTRAL = /^(0[a-z%]*|auto|100%|currentcolor|transparent|none|normal|inherit|initial|unset|revert|revert-layer)$/i;
      const walk = (rules, where) => {
        for (const rule of rules) {
          if (rule.selectorText && rule.style) {
            const hard = [];
            for (const name of rule.style) {
              // A longhand left empty comes from a shorthand that uses var().
              const value = rule.style.getPropertyValue(name).trim();
              if (PROPS.test(name) && value && !value.includes('var(') && !value.split(/\s+/).every((part) => NEUTRAL.test(part))) hard.push(`${name}: ${value}`);
            }
            if (hard.length) out.token.push(`${where} ${rule.selectorText} { ${hard.join('; ')} }`);
          }
          if (rule.cssRules) walk(rule.cssRules, where);
        }
      };
      for (const sheet of sheets) {
        if (sheet.href && TOKENS.test(sheet.href)) continue;
        try {
          walk(sheet.cssRules, sheet.href ? sheet.href.split('/').pop() : '<style>');
        } catch { /* a cross-origin stylesheet cannot be read */ }
      }
    }
    return out;
  };

  // The themes the page's CSS declares, read once.
  await page.goto(url);
  await page.waitForLoadState('load');
  const declared = await page.evaluate(() => {
    let dark = /dark/.test(document.querySelector('meta[name="color-scheme"]')?.content || '');
    const named = new Set();
    const walk = (rules) => {
      for (const rule of rules) {
        if (rule.media && /prefers-color-scheme:\s*dark/.test(rule.media.mediaText)) dark = true;
        if (rule.style && /dark/.test(rule.style.getPropertyValue('color-scheme'))) dark = true;
        for (const match of (rule.selectorText || '').matchAll(/\[data-theme=["']?([\w-]+)/g)) named.add(match[1]);
        if (rule.cssRules) walk(rule.cssRules);
        try {
          if (rule.styleSheet) walk(rule.styleSheet.cssRules);
        } catch { /* cross-origin @import */ }
      }
    };
    for (const sheet of document.styleSheets) {
      try {
        walk(sheet.cssRules);
      } catch { /* a cross-origin stylesheet cannot be read */ }
    }
    return { dark, named: [...named] };
  });
  const themes = declared.dark ? [{ name: 'light', scheme: 'light' }, { name: 'dark', scheme: 'dark' }] : [];
  for (const name of declared.named) themes.push({ name, scheme: null, attr: name });
  if (!themes.length) themes.push({ name: '', scheme: null });

  for (const theme of themes) {
    for (const size of WIDTHS) {
      const at = theme.name ? `${size[0]} ${theme.name}` : `${size[0]}`;
      const add = (kind, detail, rule) => found.push(rule ? { kind, at, rule, detail } : { kind, at, detail });

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
      await open(size, 'no-preference', theme);
      // Lazy images below the first screen are only requested when scrolled to: request them all now.
      await page.evaluate(() => {
        for (const img of document.images) {
          if (img.loading === 'lazy') img.loading = 'eager';
        }
      });
      await page.waitForFunction(() => [...document.images].every((img) => img.complete), null, { timeout: IMAGE_TIMEOUT }).catch(() => {});
      const state = await page.evaluate(withMotion);
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
      for (const detail of errors) add('console', detail);
      if (state.scrolls) add('reflow', 'the page scrolls sideways');
      for (const img of state.images) {
        if (img.broken) add('broken-image', img.src);
        if (img.pending) add('broken-image', `${img.src} (still loading after ${IMAGE_TIMEOUT / 1000} s)`);
      }
      for (const text of state.emptyLinks) add('empty-link', text);
      for (const detail of state.slow) add('transition-duration', detail);

      // With reduced motion: the final state, which must show every piece of content and stand still.
      await open(size, 'reduce', theme);
      for (const text of await page.evaluate(hiddenText)) add('hidden-under-reduced-motion', text);
      for (const el of await page.evaluate(stillMoving)) add('reduced-motion', el);
      for (const [kind, details] of Object.entries(await page.evaluate(layout))) {
        for (const detail of details) add(kind, detail);
      }
      try {
        await page.addScriptTag({ url: AXE });
        const violations = await page.evaluate(async () => {
          const result = await window.axe.run(document, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
            rules: { 'target-size': { enabled: true } },
          });
          return result.violations
            .filter((v) => v.impact === 'serious' || v.impact === 'critical')
            .map((v) => ({ rule: v.id, impact: v.impact, help: v.help, targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
        });
        for (const v of violations) add('axe', `${v.impact}: ${v.help} (${v.targets.join(', ')})`, v.rule);
      } catch (error) {
        add('check-failed', `accessibility checks could not run: ${error.message}`);
      }

      // Walk the page with Tab: every control must be reached, and its focus must show.
      const total = await page.evaluate(() => {
        const c = window.__check;
        document.activeElement?.blur?.();
        c.targets = [...document.querySelectorAll(c.TARGETS)].filter((el) => c.visible(el) && !el.matches(':disabled'));
        c.before = c.targets.map(c.look);
        c.reached = new Set();
        c.unseen = [];
        return c.targets.length;
      });
      for (let i = 0; i < total + 50; i++) {
        await page.keyboard.press('Tab');
        const done = await page.evaluate(() => {
          const c = window.__check;
          const el = document.activeElement;
          if (!el || el === document.body) return c.reached.size > 0; // back to the browser: the walk is over
          if (el.tagName === 'IFRAME') return false; // walking through an embed
          if (c.reached.has(el)) return true; // looped
          c.reached.add(el);
          const index = c.targets.indexOf(el);
          if (index !== -1) {
            for (const animation of document.getAnimations()) {
              if (animation instanceof CSSTransition) animation.finish();
            }
            if (c.look(el) === c.before[index]) c.unseen.push(c.describe(el));
          }
          return false;
        });
        if (done) break;
      }
      const keyboard = await page.evaluate(() => {
        const c = window.__check;
        const COMPOSITE = '[role="tablist"], [role="menu"], [role="menubar"], [role="listbox"], [role="radiogroup"], [role="toolbar"], [role="grid"], [role="tree"]';
        const reached = [...c.reached];
        const missed = c.targets.filter((el) => {
          if (c.reached.has(el)) return false;
          // One radio per group takes the focus; arrow keys move inside the group.
          if (el.type === 'radio' && reached.some((r) => r.type === 'radio' && r.name === el.name)) return false;
          // A composite widget keeps one member in the Tab order (roving tabindex).
          const widget = el.closest(COMPOSITE);
          return !(widget && reached.some((r) => widget.contains(r)));
        });
        return { missed: missed.map(c.describe), unseen: c.unseen };
      });
      for (const el of keyboard.missed) add('keyboard', `never reached with Tab: ${el}`);
      for (const el of keyboard.unseen) add('focus-visible', el);
    }
  }

  // Leave the page as a visitor sees it, reloaded so that scripts which read
  // prefers-reduced-motion once at load take their normal path again.
  await page.emulateMedia({ reducedMotion: null, colorScheme: null });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url);
  await page.waitForLoadState('load');

  // The same problem seen in several passes is reported once, with every place it was seen.
  const issues = [];
  for (const issue of found) {
    const same = issues.find((i) => i.kind === issue.kind && i.rule === issue.rule && i.detail === issue.detail);
    if (same) same.at = `${same.at}, ${issue.at}`;
    else issues.push(issue);
  }
  // At most MAX_PER_KIND per measure, so that a page full of one mistake stays short to read.
  const counts = {};
  const kept = issues.filter((issue) => (counts[issue.kind] = (counts[issue.kind] || 0) + 1) <= MAX_PER_KIND);
  for (const [kind, count] of Object.entries(counts)) {
    if (count > MAX_PER_KIND) kept.push({ kind, at: '', detail: `+${count - MAX_PER_KIND} more` });
  }
  return { url, pass: issues.length === 0, themes: themes.map((t) => t.name).filter(Boolean), issues: kept };
}
