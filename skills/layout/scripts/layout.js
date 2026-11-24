// layout.js · what the layout of the open page really is (design-studio v1, skill `layout`).
// Usage: open the page with browser_navigate, then call browser_run_code_unsafe with
// { "filename": "<path to>/layout.js" }. It resizes the page through 1440, 1024, 768, 390 and 320 px
// (900 px high from 768 up, 844 below) and returns, with fixed and sticky elements left out:
// - sections: columns in a row per section at 1440 and at 390 (flex and grid rows of boxes at least
//   100 px wide and 40 px high, wholly on screen, decorative ones left out), and maxCols;
// - proximity: at every width, each h1-h4 with the gap to the nearest content above and below it (within
//   4 times its size, an image or a short kicker on top of it counted as part of it); a fault when the
//   heading is not closer to what it introduces than to what precedes it. A heading set beside its
//   content, with nothing close below, is not judged;
// - crushed: text of 3 lines or more under 12 characters per line, or of 2 lines under 6 (under 32 px,
//   no <br>), per width; sideways: the widths at which the page scrolls sideways;
// - spacing: distinct margin, padding and gap values, how many cover 90 % of uses, the most used;
//   radii: values, and each rounded surface inside another with an even inset, as concentric
//   (outer = inner + inset), same or other;
// - firstScreen at 1440 × 900 and 390 × 844: whether the first section fills it, whether the h1 is
//   whole (null without a visible h1; it may be the site's name), how many filled buttons show;
// - reordered: flex and grid containers whose children show in another order than the source.
// One standard sets pass to false: a focused element entirely hidden by a fixed or sticky element
// (WCAG 2.4.11), tried at 1440 and 390 on the first 300 focusable elements, with smooth scrolling off.
// It does not see: menus or dialogs once opened, CSS columns or floats as columns, ::before and ::after
// content, short screens, whether a reordering changes the meaning (WCAG 1.3.2 is the critic's), or
// whether the composition is good.
async (page) => {
  const WIDTHS = [1440, 1024, 768, 390, 320];
  const MAX_PER_KIND = 10;
  const url = page.url().split('#')[0];
  const start = page.viewportSize();
  const frame = () => page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));

  await page.evaluate(() => {
    const cs = (el) => getComputedStyle(el);
    const shown = (el) => {
      const s = cs(el);
      const r = el.getBoundingClientRect();
      return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && r.width > 1 && r.height > 1;
    };
    const floating = (el) => {
      for (let e = el; e && e !== document.documentElement; e = e.parentElement) if (/fixed|sticky/.test(cs(e).position)) return e;
      return null;
    };
    const describe = (el) => {
      const classes = [...el.classList].slice(0, 2);
      const label = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30);
      return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${classes.map((name) => `.${name}`).join('')}${label ? ` "${label}"` : ''}`;
    };
    // Computed colours may be rgb(), rgba() or a CSS Color 4 form with "/ alpha".
    const alpha = (color) => {
      if (!color || color === 'transparent') return 0;
      const slash = color.match(/\/\s*([\d.]+)(%?)\s*\)$/);
      if (slash) return slash[2] ? slash[1] / 100 : +slash[1];
      const rgba = color.match(/^rgba\((?:[^,]+,){3}\s*([\d.]+)\)$/);
      return rgba ? +rgba[1] : 1;
    };
    const page = (r) => ({ left: r.left + scrollX, right: r.right + scrollX, top: r.top + scrollY, bottom: r.bottom + scrollY });
    const sameRow = (a, b) => Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5 * Math.min(a.bottom - a.top, b.bottom - b.top);
    const blockOf = (el) => {
      while (el.parentElement && ['inline', 'contents'].includes(cs(el).display)) el = el.parentElement;
      return el;
    };

    // Content: text blocks (from their line boxes), media, controls.
    const items = () => {
      const out = [];
      const texts = new Map();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const parent = node.parentElement;
        if (!parent || !node.textContent.trim() || parent.closest('script, style, noscript, template, svg, [aria-hidden="true"]')) continue;
        if (!shown(parent) || floating(parent)) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0).map(page);
        if (!rects.length) continue;
        const block = parent.closest('h1, h2, h3, h4') || blockOf(parent); // a heading may hold block spans
        if (!texts.has(block)) texts.set(block, { el: block, rects: [], chars: 0 });
        const t = texts.get(block);
        t.rects.push(...rects);
        t.chars += node.textContent.trim().replace(/\s+/g, ' ').length;
      }
      for (const t of texts.values()) {
        const sorted = t.rects.sort((a, b) => a.top - b.top);
        let lines = 0;
        let last = -Infinity;
        for (const r of sorted) if (r.top > last + (r.bottom - r.top) / 2) { lines++; last = r.top; }
        out.push({
          el: t.el, kind: /^H[1-4]$/.test(t.el.tagName) ? 'heading' : 'text', lines, chars: t.chars,
          left: Math.min(...sorted.map((r) => r.left)), right: Math.max(...sorted.map((r) => r.right)),
          top: sorted[0].top, bottom: Math.max(...sorted.map((r) => r.bottom)),
        });
      }
      for (const el of document.querySelectorAll('img, video, canvas, picture, svg')) {
        if (el.parentElement?.closest('svg') || !shown(el) || floating(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.width >= 40 && r.height >= 40) out.push({ el, kind: 'media', ...page(r) });
      }
      for (const el of document.querySelectorAll('a[href], button, input, select, textarea')) {
        if (!shown(el) || floating(el)) continue;
        const r = el.getBoundingClientRect();
        const filled = alpha(cs(el).backgroundColor) > 0.5 && r.height >= 24 && r.height <= 80;
        out.push({ el, kind: 'control', filled, ...page(r) });
      }
      return out;
    };

    // Sections: the children of main (or body), past wrappers with a single child.
    const sections = () => {
      let spine = document.querySelector('main') || document.body;
      for (let k = 0; k < 8; k++) {
        const kids = [...spine.children].filter((c) => shown(c) && c.getBoundingClientRect().height > 100);
        if (kids.length === 1) spine = kids[0];
        else break;
      }
      return [...spine.children].filter((c) => shown(c) && !floating(c)
        && !c.matches('header, nav, footer, script, style, [role="banner"], [role="navigation"], [role="contentinfo"]')
        && c.getBoundingClientRect().height >= 48);
    };

    // Decorative or layered children are not columns, nor part of a reading order.
    const flowKids = (c) => [...c.children].filter((k) => shown(k) && !/absolute|fixed/.test(cs(k).position) && !k.matches('[aria-hidden="true"]'));

    // The most boxes side by side in one flex or grid row of the section, each wholly on screen.
    const cols = (root) => {
      let best = 1;
      for (const c of [root, ...root.querySelectorAll('*')]) {
        if (!/flex|grid/.test(cs(c).display) || !shown(c)) continue;
        const kids = flowKids(c).map((k) => ({ k, r: k.getBoundingClientRect() }))
          .filter(({ k, r }) => r.width >= 100 && r.height >= 40 && !(k.matches('a, button') && r.height < 80)
            && (k.textContent.trim() || k.querySelector('img, video, picture, canvas, svg')));
        if (kids.length < 2) continue;
        best = Math.max(best, kids.filter(({ r }) => sameRow(r, kids[0].r) && r.left >= -1 && r.right <= innerWidth + 1).length);
      }
      return best;
    };

    // A heading belongs to what follows it: the gap above should be the larger one.
    const proximity = (all) => {
      const flow = all.filter((i) => i.kind !== 'control' || i.filled);
      const out = { n: 0, closer: 0, faults: [] };
      for (const h of all.filter((i) => i.kind === 'heading')) {
        const across = (i) => Math.min(i.right, h.right) - Math.max(i.left, h.left) > 10;
        const others = flow.filter((i) => i !== h && !h.el.contains(i.el) && !i.el.contains(h.el) && across(i));
        const below = others.filter((i) => i.top >= h.bottom - 2).map((i) => i.top - h.bottom);
        const nearestAbove = (y) => others.filter((i) => i.bottom <= y + 2).sort((a, b) => b.bottom - a.bottom)[0];
        if (!below.length) continue;
        const gapBelow = Math.max(0, Math.min(...below));
        // An image, an icon or a short kicker right on top of the heading belongs to it: start the group there.
        let top = h.top;
        let above = nearestAbove(top);
        const size = parseFloat(cs(h.el).fontSize);
        const label = (i) => i.kind === 'media' || (i.kind === 'text' && i.lines === 1 && i.chars <= 40 && parseFloat(cs(i.el).fontSize) <= size);
        if (above && label(above) && top - above.bottom <= gapBelow) {
          top = above.top;
          above = nearestAbove(top);
        }
        // Content far below is not what the heading introduces (a CSS background image this script cannot see).
        if (!above || gapBelow > 4 * size) continue;
        const gapAbove = Math.max(0, top - above.bottom);
        out.n++;
        if (gapAbove > gapBelow) out.closer++;
        else out.faults.push({ at: describe(h.el), detail: `${Math.round(gapAbove)} px above, ${Math.round(gapBelow)} px below` });
      }
      return out;
    };

    const crushed = (all) => all
      .filter((i) => (i.kind === 'text' || i.kind === 'heading') && ((i.lines >= 3 && i.chars / i.lines < 12) || (i.lines === 2 && i.chars / i.lines < 6)))
      .filter((i) => parseFloat(cs(i.el).fontSize) < 32 && !i.el.querySelector('br') && !i.el.closest('pre'))
      .map((i) => `${describe(i.el)}: ${i.lines} lines of ${Math.round(i.chars / i.lines)} characters`);

    const spacing = () => {
      const count = new Map();
      for (const el of document.body.querySelectorAll('*')) {
        if (!shown(el) || floating(el)) continue;
        const s = cs(el);
        for (const name of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginBottom', 'rowGap', 'columnGap']) {
          const v = Math.round((parseFloat(s[name]) || 0) * 2) / 2;
          if (v > 0) count.set(v, (count.get(v) || 0) + 1);
        }
      }
      const sorted = [...count.entries()].sort((a, b) => b[1] - a[1]);
      const total = sorted.reduce((sum, [, n]) => sum + n, 0);
      let covered = 0;
      const for90 = sorted.findIndex(([, n]) => (covered += n) >= 0.9 * total) + 1;
      return { distinct: sorted.length, for90, top: sorted.slice(0, 8).map(([v, n]) => `${v}×${n}`) };
    };

    const radii = () => {
      const surface = (el) => {
        const s = cs(el);
        return alpha(s.backgroundColor) > 0.05 || (parseFloat(s.borderTopWidth) > 0 && alpha(s.borderTopColor) > 0)
          || s.boxShadow !== 'none' || /^(IMG|VIDEO|PICTURE|CANVAS)$/.test(el.tagName);
      };
      const values = new Map();
      const rounded = [];
      for (const el of document.body.querySelectorAll('*')) {
        if (!shown(el) || floating(el)) continue;
        const r = el.getBoundingClientRect();
        const raw = cs(el).borderTopLeftRadius;
        const radius = raw.endsWith('%') ? (parseFloat(raw) / 100) * Math.min(r.width, r.height) : parseFloat(raw) || 0;
        if (radius <= 0) continue;
        if (radius >= Math.min(r.width, r.height) / 2 - 1) {
          values.set('pill', (values.get('pill') || 0) + 1);
          continue;
        }
        if (!surface(el)) continue;
        const v = Math.round(radius * 2) / 2;
        values.set(v, (values.get(v) || 0) + 1);
        rounded.push({ el, radius: v, r });
      }
      const nested = [];
      for (const o of rounded) {
        for (const i of rounded) {
          if (i === o || !o.el.contains(i.el)) continue;
          const insets = [i.r.left - o.r.left, o.r.right - i.r.right, i.r.top - o.r.top];
          if (insets.some((v) => v < 1 || v > 32) || Math.max(...insets) - Math.min(...insets) > 3) continue;
          const inset = Math.round(insets[0]);
          const kind = Math.abs(o.radius - (i.radius + inset)) <= 2 ? 'concentric' : Math.abs(o.radius - i.radius) <= 1 ? 'same' : 'other';
          nested.push(`${kind} · ${describe(o.el)} ${o.radius} > ${describe(i.el)} ${i.radius}, inset ${inset}`);
        }
      }
      return { values: [...values.entries()].sort((a, b) => b[1] - a[1]).map(([v, n]) => `${v}×${n}`), nested };
    };

    // Children of a flex or grid container that show before a sibling that comes earlier in the source.
    const reordered = () => {
      const out = [];
      for (const c of document.body.querySelectorAll('*')) {
        if (!/flex|grid/.test(cs(c).display) || !shown(c)) continue;
        const rtl = cs(c).direction === 'rtl';
        const kids = flowKids(c).map((k) => k.getBoundingClientRect());
        for (let i = 1; i < kids.length; i++) {
          const [a, b] = [kids[i - 1], kids[i]];
          const layered = Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
          if (layered) continue; // stacked on purpose (an image under a title), not a reading order
          const before = sameRow(a, b) ? (rtl ? b.right > a.right + 1 : b.left < a.left - 1) : b.bottom <= a.top + 1;
          if (before) {
            out.push(`${describe(c)}: visual order differs from source`);
            break;
          }
        }
      }
      return out;
    };

    const firstScreen = (all, secs) => {
      const second = secs[1] ? all.filter((i) => secs[1].contains(i.el)) : [];
      const h1 = document.querySelector('h1');
      const r = h1 && shown(h1) ? h1.getBoundingClientRect() : null;
      return {
        fills: second.length ? Math.min(...second.map((i) => i.top)) >= innerHeight : null,
        h1Whole: r ? r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth : null,
        filled: all.filter((i) => i.kind === 'control' && i.filled && i.top < innerHeight && i.bottom > 0 && i.right > 0 && i.left < innerWidth).length,
      };
    };

    // WCAG 2.4.11: once focused (and scrolled into view by the browser), part of the element must show.
    const obscured = () => {
      const out = [];
      const FOCUSABLE = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex]:not([tabindex="-1"])';
      const list = [...document.querySelectorAll(FOCUSABLE)].filter((el) => shown(el) && !floating(el) && !el.disabled).slice(0, 300);
      // A smooth scroll would still be on its way when the box is read.
      const instant = document.head.appendChild(document.createElement('style'));
      instant.textContent = '* { scroll-behavior: auto !important; }';
      for (const el of list) {
        el.focus();
        if (document.activeElement !== el) continue;
        // Judge the final state: a skip link that slides in is still moving right after focus.
        for (const a of document.getAnimations()) if (a instanceof CSSTransition) a.finish();
        const r = el.getBoundingClientRect();
        const box = { left: Math.max(0, r.left), right: Math.min(innerWidth, r.right), top: Math.max(0, r.top), bottom: Math.min(innerHeight, r.bottom) };
        if (box.right - box.left < 1 || box.bottom - box.top < 1) continue; // left off screen, inside a scroller
        let by = null;
        let seen = false;
        for (const fx of [0.15, 0.5, 0.85]) {
          for (const fy of [0.15, 0.5, 0.85]) {
            const hit = document.elementFromPoint(box.left + fx * (box.right - box.left), box.top + fy * (box.bottom - box.top));
            const cover = hit && floating(hit);
            if (!hit || hit === el || el.contains(hit) || hit.contains(el) || !cover || cover.contains(el)) seen = true;
            else by = cover;
          }
        }
        if (!seen && by) out.push({ at: describe(el), by: describe(by) });
      }
      document.activeElement?.blur?.();
      scrollTo(0, 0);
      instant.remove();
      return out;
    };

    window.__layout = { describe, items, sections, cols, proximity, crushed, spacing, radii, reordered, firstScreen, obscured };
  });

  const report = {
    url, pass: true, sections: [], maxCols: 1, proximity: { n: 0, closer: 0, faults: [] }, crushed: [], sideways: [],
    spacing: null, radii: null, firstScreen: {}, reordered: [], issues: [],
  };
  const faults = new Map();
  const hidden = new Map();
  try {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: width >= 768 ? 900 : 844 });
      await page.evaluate(() => scrollTo(0, 0));
      await frame();
      const found = await page.evaluate((w) => {
        const L = window.__layout;
        const all = L.items();
        if (!L.secs) L.secs = L.sections();
        const out = {
          crushed: L.crushed(all), cols: L.secs.map((s) => L.cols(s)), proximity: L.proximity(all),
          sideways: document.documentElement.scrollWidth > innerWidth + 1,
        };
        if (w === 1440 || w === 390) out.firstScreen = L.firstScreen(all, L.secs);
        if (w === 1440) Object.assign(out, { at: L.secs.map(L.describe), spacing: L.spacing(), radii: L.radii(), reordered: L.reordered() });
        return out;
      }, width);
      for (const c of found.crushed) if (report.crushed.length < MAX_PER_KIND) report.crushed.push(`${width} px · ${c}`);
      if (found.sideways) report.sideways.push(width);
      report.proximity.n += found.proximity.n;
      report.proximity.closer += found.proximity.closer;
      for (const f of found.proximity.faults) {
        if (!faults.has(f.at)) faults.set(f.at, { detail: f.detail, widths: [] });
        faults.get(f.at).widths.push(width);
      }
      if (width === 1440) {
        report.sections = found.at.map((at, i) => ({ at, cols: found.cols[i], phone: null }));
        report.maxCols = Math.max(1, ...found.cols);
        report.spacing = found.spacing;
        report.radii = { values: found.radii.values, nested: found.radii.nested.slice(0, MAX_PER_KIND) };
        report.reordered = found.reordered.slice(0, MAX_PER_KIND);
      }
      if (width === 390) found.cols.forEach((n, i) => { if (report.sections[i]) report.sections[i].phone = n; });
      if (found.firstScreen) {
        report.firstScreen[width] = found.firstScreen;
        for (const o of await page.evaluate(() => window.__layout.obscured())) {
          if (!hidden.has(o.at)) hidden.set(o.at, { by: o.by, widths: [] });
          hidden.get(o.at).widths.push(width);
        }
      }
    }
  } finally {
    if (start) await page.setViewportSize(start);
  }
  report.proximity.faults = [...faults.entries()].slice(0, MAX_PER_KIND).map(([at, f]) => `${at}: ${f.detail} (${f.widths.join(', ')} px)`);
  report.issues = [...hidden.entries()].slice(0, MAX_PER_KIND).map(([at, h]) => ({
    kind: 'focus-obscured', at, rule: 'WCAG 2.4.11', detail: `entirely hidden by ${h.by} at ${h.widths.join(', ')} px`,
  }));
  report.pass = report.issues.length === 0;
  return report;
}
