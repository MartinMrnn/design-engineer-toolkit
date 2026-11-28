// components.js · what the components skill can measure on the page currently open (design-studio v1).
// Usage: open the page with browser_navigate, then call browser_run_code_unsafe with
// { "filename": "<path to>/components.js" }. It returns
// { url, pass, focus, overlays, menuRoles, tabindex, disabled, bypass, live, issues: [{ kind, at, rule, detail }] }.
//
// It loads the page at 1440 × 900 with reduced motion and:
// - walks the focus with Tab (40 stops at most): the kind of indicator (drawn outline, browser default, box-shadow,
//   another change, none) on the element or one of four ancestors, once its transition ends, its width and offset and,
//   for a drawn outline over a flat ground (the browser's canvas when nothing is painted), its contrast with that
//   ground (focus-contrast, WCAG 1.4.11);
// - reads accessible names that leave out the visible label (label-in-name, WCAG 2.5.3), ARIA menu roles inside a
//   navigation (menu-role), positive tabindex (tabindex), submit buttons disabled at load (disabled-submit), and a page
//   with no main landmark, no skip link and no headings (bypass);
// - then at 1440 × 900 and 390 × 844, opens with Enter every trigger it finds ([aria-expanded], [aria-haspopup],
//   [aria-controls], [popovertarget], [commandfor], summary, buttons in a header or navigation; 12 per width), Tabs three
//   times when what opened is modal, presses Escape, and reports what opened without aria-expanded (overlay-state), an
//   overlay Escape leaves open (overlay-escape), focus dropped on body (overlay-focus), and a modal that lets Tab out
//   (overlay-leak).
// Only focus-contrast and label-in-name set `pass` to false; the rest is evidence for the agent and the critic.
// It does not see: the contrast of box-shadow rings, rings over images or gradients, a ring drawn by a sibling, an
// indicator that passes by another change, a plain button that opens a dialog with none of the attributes above, a div
// used as a trigger (check.js's keyboard), triggers that open on hover only, the arrow keys inside custom widgets.
// `focus.measured` says how many rings were measured: at 0, focus-2 was not checked.
async (page) => {
  const WIDTHS = [[1440, 900], [390, 844]];
  const MAX_STOPS = 40;
  const MAX_TRIGGERS = 12;
  const MAX_PER_KIND = 10;
  const SETTLE = [600, 2500]; // menus and dialogs may animate past 300 ms: wait at least 600 ms, at most 2.5 s
  const FAILING = ['focus-contrast', 'label-in-name'];
  const url = page.url().split('#')[0];
  const issues = [];
  const add = (kind, at, rule, detail) => {
    if (issues.some((i) => i.kind === kind && i.at === at)) return;
    if (issues.filter((i) => i.kind === kind).length >= MAX_PER_KIND) return;
    issues.push({ kind, at, rule, detail });
  };

  // Shared helpers, installed in the page after each load.
  const install = () => {
    const FOCUSABLE = 'a[href], area[href], button, input:not([type="hidden"]), select, textarea, summary, iframe, [contenteditable=""], [contenteditable="true"], [tabindex]:not([tabindex^="-"])';
    const short = (text) => (text || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    const visible = (el) => {
      const box = el.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    };
    const describe = (el) => {
      const classes = typeof el.className === 'string' ? el.className.split(/\s+/).filter(Boolean) : [];
      const label = short(el.textContent || el.getAttribute('aria-label') || el.getAttribute('alt') || '');
      return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${classes.map((name) => `.${name}`).join('')}${label ? ` "${label}"` : ''}`;
    };
    const focusables = () => [...document.querySelectorAll(FOCUSABLE)].filter((el) => !el.disabled && !el.closest('[inert]') && visible(el));
    // Any CSS colour (oklch, alpha, keywords) through a 1 × 1 canvas, as sRGB 0–255 and alpha 0–1.
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const rgba = (colour) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = colour;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return { r, g, b, a: a / 255 };
    };
    // The page's own ground when nothing is painted: white, or dark under `color-scheme: dark`.
    const probe = document.createElement('div');
    probe.style.cssText = 'position: absolute; width: 0; height: 0; background-color: Canvas';
    document.documentElement.append(probe);
    const canvas = { ...rgba(getComputedStyle(probe).backgroundColor), a: 1 };
    probe.remove();
    // The text a sighted visitor sees inside an element: no visually hidden text, nothing transparent.
    const clipped = (node, root) => {
      for (let n = node; n && n !== root.parentElement; n = n.parentElement) {
        const style = getComputedStyle(n);
        const box = n.getBoundingClientRect();
        if (style.clipPath === 'inset(50%)' || style.clip === 'rect(0px, 0px, 0px, 0px)' || (box.width <= 1 && box.height <= 1 && style.display !== 'contents')) return true;
      }
      return false;
    };
    const shown = (el) => {
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const parts = [];
      for (let t = walk.nextNode(); t; t = walk.nextNode()) {
        const parent = t.parentElement;
        if (t.textContent.trim() && parent.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && !clipped(parent, el)) parts.push(t.textContent);
      }
      return parts.join(' ').trim();
    };
    const over = (top, base) => ({ r: top.r * top.a + base.r * (1 - top.a), g: top.g * top.a + base.g * (1 - top.a), b: top.b * top.a + base.b * (1 - top.a), a: 1 });
    const luminance = ({ r, g, b }) => [r, g, b].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
    const ratio = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
    // The ground under a point: the backgrounds from the element there down to the first opaque one.
    // null when an image, a video, a canvas or a background image is on the way.
    const ground = (start) => {
      const layers = [];
      for (let el = start; el; el = el.parentElement) {
        if (/^(IMG|VIDEO|CANVAS|IFRAME|PICTURE)$/.test(el.tagName)) return null;
        const style = getComputedStyle(el);
        if (style.backgroundImage !== 'none') return null;
        const colour = rgba(style.backgroundColor);
        if (colour.a > 0) layers.push(colour);
        if (colour.a >= 1) break;
      }
      return layers.reverse().reduce((base, layer) => over(layer, base), canvas);
    };
    // Where focus is: on the trigger, inside what opened, on body, or elsewhere.
    const place = () => {
      const { t, modal, fresh } = window.__o;
      const a = document.activeElement;
      if (a === t) return 'trigger';
      if (!a || a === document.body || a === document.documentElement) return 'body';
      if ((modal && modal.contains(a)) || fresh.some((el) => el === a || el.contains(a))) return 'inside';
      const region = document.getElementById(t.getAttribute('aria-controls') || '') || document.getElementById(t.getAttribute('popovertarget') || '');
      return region && region.contains(a) ? 'inside' : 'elsewhere';
    };
    window.__c = { FOCUSABLE, short, visible, describe, focusables, rgba, over, ratio, ground, place, shown };
  };

  // Reads the page until the reading stops changing (or `done` holds and it is stable), within SETTLE.
  const settle = async (fn, done = () => true) => {
    await page.waitForTimeout(SETTLE[0]);
    const start = Date.now();
    let last = await page.evaluate(fn);
    for (;;) {
      if (Date.now() - start > SETTLE[1] - SETTLE[0]) return last;
      await page.waitForTimeout(200);
      const next = await page.evaluate(fn);
      if (JSON.stringify(next) === JSON.stringify(last) && done(next)) return next;
      last = next;
    }
  };

  const load = async ([width, height]) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height });
    await page.goto(url);
    await page.waitForLoadState('load');
    await page.evaluate(() => document.fonts && document.fonts.ready.then(() => true));
    await page.waitForTimeout(800);
    await page.evaluate(install);
  };

  // What the markup says, before anything is focused.
  const markup = () => {
    const c = window.__c;
    const norm = (text) => (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const FIELD = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea';
    const labelled = [...document.querySelectorAll(`a[href], button, input[type="submit"], input[type="button"], [role="button"], [role="link"], [role="tab"], [role="menuitem"], ${FIELD}`)]
      // A combobox or a select shows its value, not its label; a field is labelled by its <label>.
      .filter((el) => c.visible(el) && (el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby')) && (el.matches(FIELD) ? el.labels?.length : !el.matches('[role="combobox"], [role="listbox"], [aria-haspopup="listbox"]')))
      .flatMap((el) => {
        const shown = el.matches(FIELD) ? [...el.labels].map(c.shown).join(' ') : el.matches('input') ? el.value : c.shown(el);
        const seen = norm(shown);
        if (!/\p{L}/u.test(seen)) return [];
        const ids = (el.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean);
        const name = ids.length ? ids.map((id) => document.getElementById(id)?.textContent || '').join(' ') : el.getAttribute('aria-label');
        // Extra visible words (a badge, a signature) are not a failure; a name that shares nothing with the label is.
        return norm(name).includes(seen) || seen.includes(norm(name)) ? [] : [{ at: c.describe(el), detail: `visible "${c.short(shown)}", name "${c.short(name)}"` }];
      });
    return {
      labelled,
      menuRoles: [...document.querySelectorAll('nav [role="menu"], nav [role="menubar"], [role="navigation"] [role="menu"], [role="navigation"] [role="menubar"], nav[role="menubar"], nav[role="menu"]')].map(c.describe),
      tabindex: [...document.querySelectorAll('[tabindex]')].filter((el) => parseInt(el.getAttribute('tabindex'), 10) > 0).map((el) => `${c.describe(el)}: ${el.getAttribute('tabindex')}`),
      disabled: [...document.querySelectorAll('button[disabled], input[type="submit"][disabled]')].filter((el) => el.type === 'submit' && el.form && c.visible(el)).map(c.describe),
      main: !!document.querySelector('main, [role="main"]'),
      headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]').length,
      live: document.querySelectorAll('[role="status"], [role="alert"], [role="log"], [aria-live]:not([aria-live="off"])').length,
    };
  };

  // One Tab stop: its indicator, read focused then blurred; the next Tab starts from it all the same.
  const stop = () => {
    const c = window.__c;
    const el = document.activeElement;
    if (!el || el === document.body || el === document.documentElement) return null;
    const LOOK = ['outline-style', 'outline-width', 'outline-color', 'outline-offset', 'box-shadow', 'background-color', 'color', 'text-decoration-line', 'border-top-color'];
    // The element and four ancestors: a card may draw the ring of the link inside its heading.
    const chain = [el];
    while (chain.length < 5 && chain[chain.length - 1].parentElement) chain.push(chain[chain.length - 1].parentElement);
    // A ring that fades in is read at its end, not on its first frame.
    const finish = () => chain.forEach((node) => node.getAnimations().forEach((a) => { if (a instanceof CSSTransition) a.finish(); }));
    const read = () => chain.map((node) => Object.fromEntries(LOOK.map((name) => [name, getComputedStyle(node).getPropertyValue(name)])));
    finish();
    const on = read();
    // Each possible ring is measured now, while focused: a skip link leaves the screen on blur.
    const rings = chain.map((node, i) => (/^(none|auto)$/.test(on[i]['outline-style']) ? null : ring(node, on[i])));
    const inMain = !!el.closest('main, [role="main"]');
    const skip = el.matches('a[href^="#"]') && el.getAttribute('href').length > 1 && !!document.getElementById(decodeURIComponent(el.getAttribute('href').slice(1)));
    el.blur();
    finish();
    const off = read();
    const changed = (i, name) => on[i][name] !== off[i][name];
    // An element nobody sees (a radio at opacity 0 behind its label) does not carry the visible ring.
    const drawnAt = chain.findIndex((node, i) => c.visible(node) && on[i]['outline-style'] !== 'none' && ['outline-style', 'outline-width', 'outline-color'].some((name) => changed(i, name)));
    let kind = 'none';
    if (drawnAt >= 0) kind = on[drawnAt]['outline-style'] === 'auto' ? 'default' : 'drawn';
    else if (changed(0, 'box-shadow')) kind = 'box-shadow';
    else if (LOOK.some((name) => changed(0, name))) kind = 'other';
    const out = { at: c.describe(el), kind, inMain, skip };
    return kind === 'drawn' ? { ...out, ...rings[drawnAt] } : out;

    // A drawn outline and the ground it is drawn on: outside the box, or on the element when the offset is negative.
    function ring(target, style) {
      const width = parseFloat(style['outline-width']);
      const offset = parseFloat(style['outline-offset']) || 0;
      const result = { ring: `outline ${width}px ${style['outline-style']}, offset ${offset}px` };
      const box = target.getBoundingClientRect();
      let under = target;
      if (offset >= 0) {
        const y = Math.min(Math.max(box.top + box.height / 2, 0), innerHeight - 1);
        const left = box.left - offset - width / 2;
        const x = left >= 0 ? left : box.right + offset + width / 2;
        under = x < innerWidth ? document.elementsFromPoint(x, y).find((node) => !target.contains(node)) : target.parentElement;
      }
      const base = under ? c.ground(under) : null;
      if (!base) return { ...result, unmeasured: true };
      const colour = c.over(c.rgba(style['outline-color']), base);
      return { ...result, ratio: c.ratio(colour, base), ground: `rgb(${[base.r, base.g, base.b].map(Math.round).join(' ')})` };
    }
  };

  const candidates = () => {
    const c = window.__c;
    const list = [...document.querySelectorAll('[aria-expanded], [aria-haspopup]:not([aria-haspopup="false"]), [aria-controls], [popovertarget], [commandfor], summary, header button, nav button, [role="banner"] button, [role="navigation"] button')]
      .filter((el) => c.visible(el) && !el.disabled && !(el.type === 'submit' && el.form) && !el.matches('input, select, textarea') && !el.hasAttribute('aria-pressed') && !el.matches('a[href]:not([aria-expanded]):not([aria-haspopup])'));
    window.__cands = [...new Set(list)];
    return window.__cands.length;
  };

  const openState = () => {
    const c = window.__c;
    const o = window.__o;
    const t = o.t;
    o.modal = [...document.querySelectorAll('dialog, [aria-modal="true"]')].find((d) => c.visible(d) && (d.matches('dialog:modal') || d.getAttribute('aria-modal') === 'true')) || null;
    const details = t.tagName === 'SUMMARY' ? t.parentElement : null;
    const popover = document.getElementById(t.getAttribute('popovertarget') || '');
    const expanded = t.getAttribute('aria-expanded');
    // Controls that appeared count only inside what the trigger opened: content rendered late elsewhere is not it.
    const scope = o.modal || o.region;
    o.fresh = c.focusables().filter((el) => !o.before.has(el) && (!scope || scope.contains(el)));
    const regionShown = !!o.region && !o.regionBefore && c.visible(o.region);
    // A view switch replaces controls; a menu adds them. Controls that vanished mean it was not an opening.
    const replaced = [...o.before].some((el) => el !== t && (!el.isConnected || !c.visible(el)));
    // An overlay sits over the page: a modal, a popover, a menu or listbox (aria-haspopup), what a header or navigation
    // opens, or controls in a fixed box. A card or an accordion that unfolds in the content is not one, even when absolute.
    const fixed = o.fresh.some((el) => {
      for (let node = el; node && node !== document.body; node = node.parentElement) {
        if (node.contains(t)) return false;
        if (getComputedStyle(node).position === 'fixed') return true;
      }
      return false;
    });
    const chrome = !!t.closest('header, nav, [role="banner"], [role="navigation"]') || (t.hasAttribute('aria-haspopup') && t.getAttribute('aria-haspopup') !== 'false');
    return {
      expanded,
      // Opened means Enter changed something: an aria-expanded already true does not count.
      opened: !!o.modal || !!(details && details.open && !o.detailsBefore) || !!(popover && popover.matches(':popover-open'))
        || (expanded !== null ? expanded === 'true' && o.expandedBefore !== 'true' : o.region ? regionShown : o.fresh.length > 0 && !replaced),
      overlay: !!o.modal || !!(popover && popover.matches(':popover-open')) || fixed || (chrome && (expanded === 'true' || o.fresh.length > 0)),
      native: !!details || !!popover,
      modal: !!o.modal,
      fresh: o.fresh.length,
      focus: c.place(),
    };
  };

  const closedState = () => {
    const c = window.__c;
    const o = window.__o;
    const t = o.t;
    const details = t.tagName === 'SUMMARY' ? t.parentElement : null;
    const expanded = t.getAttribute('aria-expanded');
    const popover = document.getElementById(t.getAttribute('popovertarget') || '');
    const stillOpen = o.modal ? c.visible(o.modal)
      : details ? details.open
      : popover ? popover.matches(':popover-open')
      : expanded !== null ? expanded === 'true' || (!!o.region && c.visible(o.region))
      : o.region ? c.visible(o.region)
      : o.fresh.some((el) => c.visible(el));
    return { closed: !stillOpen, returns: c.place() };
  };

  // 1440: the markup, then the focus walk.
  await load(WIDTHS[0]);
  const facts = await page.evaluate(markup);
  for (const l of facts.labelled) add('label-in-name', l.at, 'element-4', l.detail);
  for (const m of facts.menuRoles) add('menu-role', m, 'element-6', 'an ARIA menu role inside a navigation');
  for (const t of facts.tabindex) add('tabindex', t, 'focus-7', 'a positive tabindex');
  for (const d of facts.disabled) add('disabled-submit', d, 'ux behaviour-6', 'a submit button disabled at load');

  const stops = [];
  for (let i = 0; i < MAX_STOPS; i++) {
    await page.keyboard.press('Tab');
    const s = await page.evaluate(stop);
    if (!s) break;
    if (stops.some((prev) => prev.at === s.at && prev.first)) break;
    stops.push({ ...s, first: i === 0 });
  }
  const focus = { stops: stops.length, measured: 0, kinds: { drawn: 0, default: 0, 'box-shadow': 0, other: 0, none: 0 }, rings: [], unmeasured: [] };
  for (const s of stops) {
    focus.kinds[s.kind]++;
    if (s.kind !== 'drawn') continue;
    if (s.unmeasured) { focus.unmeasured.push(`${s.at}: over an image or a gradient`); continue; }
    focus.rings.push(`${s.at}: ${s.ring}, ${s.ratio.toFixed(1)}:1 on ${s.ground}`);
    focus.measured++;
    if (s.ratio < 3) add('focus-contrast', s.at, 'focus-2', `${s.ratio.toFixed(1)}:1 on ${s.ground}, under 3:1`);
  }
  const firstInMain = stops.findIndex((s) => s.inMain);
  const bypass = { main: facts.main, skip: !!stops[0]?.skip, headings: facts.headings, before: firstInMain >= 0 ? firstInMain : stops.length };
  if (!bypass.main && !bypass.skip && !bypass.headings) add('bypass', 'page', 'focus-4', 'no main landmark, no skip link and no headings');

  // 1440 then 390: every trigger, opened with Enter, then Escape.
  const overlays = [];
  for (const size of WIDTHS) {
    await load(size);
    let n = await page.evaluate(candidates);
    let dirty = false;
    for (let i = 0; i < Math.min(n, MAX_TRIGGERS); i++) {
      if (dirty) { await load(size); n = await page.evaluate(candidates); dirty = false; }
      try {
      const at = await page.evaluate((i) => {
        const c = window.__c;
        const t = window.__cands[i];
        if (!t || !c.visible(t)) return null;
        const region = document.getElementById(t.getAttribute('aria-controls') || t.getAttribute('popovertarget') || t.getAttribute('commandfor') || '');
        window.__o = { t, before: new Set(c.focusables()), fresh: [], modal: null, expandedBefore: t.getAttribute('aria-expanded'),
          region, regionBefore: !!region && c.visible(region), detailsBefore: t.tagName === 'SUMMARY' && t.parentElement.open };
        t.focus();
        return c.describe(t);
      }, i);
      if (!at) continue;
      const expandedBefore = await page.evaluate(() => window.__o.t.getAttribute('aria-expanded'));
      await page.keyboard.press('Enter');
      if (page.url().split('#')[0] !== url) { dirty = true; continue; }
      const open = await settle(openState);
      if (page.url().split('#')[0] !== url) { dirty = true; continue; }
      if (!open.opened) continue;
      const row = { at, width: size[0], expanded: open.expanded === null ? 'none' : `${expandedBefore} → ${open.expanded}`, opened: true, modal: open.modal, focus: open.focus, leaves: false };
      if (open.modal) {
        for (let k = 0; k < 3; k++) await page.keyboard.press('Tab');
        row.leaves = await page.evaluate(() => {
          const a = document.activeElement;
          return !!a && a !== document.body && !window.__o.modal.contains(a);
        });
      }
      await page.keyboard.press('Escape');
      const closed = await settle(closedState, (r) => r.closed);
      row.escape = closed.closed ? 'closes' : 'stays';
      row.returns = closed.returns;
      overlays.push(row);
      if (open.expanded === null && !open.modal && !open.native) add('overlay-state', at, 'element-2', 'opens without aria-expanded');
      if (open.overlay && !closed.closed) add('overlay-escape', at, 'ux path-2', 'Escape leaves it open');
      if (closed.closed && closed.returns === 'body') add('overlay-focus', at, 'focus-6', 'focus dropped on body after Escape');
      if (row.leaves) add('overlay-leak', at, 'pattern-3', 'Tab leaves the open modal');
      if (!closed.closed || open.modal) dirty = true;
      } catch {
        // The trigger reloaded or replaced the page: what it did cannot be read. Start the next one on a fresh load.
        dirty = true;
      }
    }
  }

  return {
    url,
    pass: !issues.some((i) => FAILING.includes(i.kind)),
    focus,
    overlays,
    menuRoles: facts.menuRoles,
    tabindex: facts.tabindex,
    disabled: facts.disabled,
    bypass,
    live: facts.live,
    issues,
  };
}
