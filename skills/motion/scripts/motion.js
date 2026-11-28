// motion.js · how the open page really moves (design-studio v1, skill `motion`).
// Usage: open the page with browser_navigate, then call browser_run_code_unsafe with
// { "filename": "<path to>/motion.js" }. At 1440 × 900 it loads the page twice and returns:
// With motion:
// - transitions: on what a visitor hovers, presses or opens (controls, what they hold, overlays, what
//   aria-controls points to), each element's longest transition: how many, the median (delay included),
//   the class of each curve (out, in, in-out, ease, linear, steps, spring for a linear() with stops); and
//   the transitions over 300 ms, on `all`, on an ease-in curve, or on a layout property (width, height,
//   top, left, right, bottom, inset, margin, padding);
// - entrances: @keyframes, @starting-style rules and running animations that start from a uniform zero scale;
// - hover: :hover rules that move (transform, translate, scale, rotate) outside a (hover: hover) query;
// - reveals: blocks below the first screen hidden at load (faded, moved away, or clipped) that show up once
//   the page is scrolled to its end with the wheel, each counted once at its outermost hidden block, and
//   their share; `lost`, faded blocks that never show up;
// - scroll: a smooth-scroll takeover (Lenis), scroll-behavior: smooth, scroll-driven animations
//   (animation-timeline), GSAP ScrollTrigger instances with scrub and pin, sticky sections pinned inside a
//   taller parent, and how far the window scrolled;
// - loops: what keeps moving at rest, CSS or script alike (every element's box and computed transform read
//   six times over 600 ms, over the whole page; one change is a jump, two or more are motion): in view at
//   load (`running`), or out of view (`offscreen`);
// - generator: the page's <meta name="generator">, such as a site builder whose motion is script-driven.
// With reduced motion, loaded again: what still moves in the first 600 ms after the document is parsed, at
// rest anywhere on the page, or with the scroll (computed transforms read at each wheel step); animations
// that move; blocks that still slide in; a smooth-scroll takeover still active.
// Spinners and progress bars ([role=status], [role=progressbar], [aria-busy=true]) may keep moving.
// One rule sets pass to false: movement that persists under reduced motion (motion `proof-2`, the
// studio's bar; WCAG 2.3.3 is AAA). Everything else is a finding to judge against the skill's rules.
// It does not see: flashes (WCAG 2.3.1), how motion feels, cross-origin style sheets, menus and dialogs
// once opened, motion set off by a hover or a key, content hidden when JavaScript is off, pages that scroll
// inside their own container.
async (page) => {
  const MAX = 10;
  const href = page.url();
  const url = href.split('#')[0];
  const start = page.viewportSize();

  // Installed in the page after each load.
  const install = () => {
    const TARGETS = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="tab"], [role="menuitem"], [role="switch"], [tabindex]:not([tabindex^="-"])';
    const OVERLAYS = 'dialog, [popover], [role="dialog"], [role="menu"], [role="listbox"], [aria-modal="true"]';
    const BLOCKS = 'h1, h2, h3, h4, p, li, img, video, figure, blockquote, a, button';
    const PROGRESS = '[role="status"], [role="progressbar"], [aria-busy="true"]';
    const MOVING = /^(transform|translate|scale|rotate|top|left|right|bottom|offset(-|[A-Z]))/;
    const LAYOUT = /^(width|height|top|left|right|bottom|inset|margin|padding)/;
    const ZERO = /scale\(\s*0(?:\.0*)?\s*(?:,\s*0(?:\.0*)?\s*)?\)|scale3d\(\s*0(?:\.0*)?\s*,\s*0(?:\.0*)?\s*,/;
    const own = (el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${[...el.classList].slice(0, 2).map((c) => `.${c}`).join('')}`;
    // An element with no id or class is named after its nearest ancestor that has one: `svg.logo circle`.
    const name = (el) => {
      const label = el.getAttribute('aria-label');
      const tail = label ? ` "${label.trim().slice(0, 30)}"` : '';
      if (el.id || el.classList.length) return own(el) + tail;
      const anchor = el.parentElement?.closest('[id], [class]');
      return (anchor && anchor !== document.body ? `${own(anchor)} ${own(el)}` : own(el)) + tail;
    };
    // A selector with :hover outside :not(), so the rule applies while hovered.
    const onHover = (selector) => {
      let out = '';
      for (let i = 0; i < selector.length; i++) {
        if (selector.startsWith(':not(', i)) {
          let depth = 0;
          for (i += 4; i < selector.length; i++) {
            if (selector[i] === '(') depth += 1;
            else if (selector[i] === ')' && --depth === 0) break;
          }
        } else out += selector[i];
      }
      return out.includes(':hover');
    };
    const opacity = (el) => {
      let o = 1;
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= +getComputedStyle(n).opacity;
      return o;
    };
    const moved = (el) => {
      const t = el && getComputedStyle(el).transform;
      if (!t || t === 'none') return false;
      const m = new DOMMatrixReadOnly(t);
      return Math.abs(m.m41) > 2 || Math.abs(m.m42) > 2 || Math.hypot(m.a, m.b) < 0.98 || Math.hypot(m.c, m.d) < 0.98;
    };
    const zero = (style) => ZERO.test(style.transform || '') || /^0(?:\.0*)?(?:\s+0(?:\.0*)?)*$/.test(String(style.scale || '').trim());
    const off = (el) => {
      const r = el.getBoundingClientRect();
      return r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth;
    };
    const progress = (el) => !!el.closest(PROGRESS);
    // Every readable rule, with what it sits in.
    const rules = () => {
      const out = [];
      const walk = (list, ctx) => {
        for (const rule of list) {
          out.push({ rule, ...ctx });
          if (!rule.cssRules) continue;
          walk(rule.cssRules, {
            gated: ctx.gated || (rule instanceof CSSMediaRule && /hover\s*:\s*hover/.test(rule.conditionText)),
            starting: ctx.starting || rule.constructor.name === 'CSSStartingStyleRule',
          });
        }
      };
      for (const sheet of document.styleSheets) {
        try { walk(sheet.cssRules, { gated: false, starting: false }); } catch { /* a cross-origin sheet */ }
      }
      return out;
    };
    // What a visitor hovers, presses or opens, as check.js reads it.
    const ui = () => {
      const set = new Set(document.querySelectorAll(OVERLAYS));
      for (const el of document.querySelectorAll(TARGETS)) {
        set.add(el);
        for (const child of el.querySelectorAll('*')) set.add(child);
      }
      for (const el of document.querySelectorAll('[aria-controls]')) {
        for (const id of el.getAttribute('aria-controls').split(/\s+/)) {
          const target = document.getElementById(id);
          if (target) set.add(target);
        }
      }
      return set;
    };
    // A curve's class from its slopes at the start and at the end.
    const curve = (fn) => {
      if (fn === 'ease' || fn === 'linear') return fn;
      if (/^steps|^step-/.test(fn)) return 'steps';
      if (fn.startsWith('linear(')) return fn.split(',').length > 2 ? 'spring' : 'linear';
      const named = { 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1] }[fn];
      const [x1, y1, x2, y2] = named || (fn.match(/-?[\d.]+/g) || []).map(Number);
      if (y2 === undefined) return 'linear';
      const first = x1 === 0 ? Infinity : y1 / x1;
      const last = x2 === 1 ? Infinity : (1 - y2) / (1 - x2);
      if (first < 1) return last < 1 ? 'in-out' : 'in';
      return last < 1 ? 'out' : 'linear';
    };
    // Every element's box (in page coordinates) and computed transform.
    const sample = (els) => els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height, t: getComputedStyle(el).transform };
    });
    // Moved means more than 1 px, or more than 1 % of scale or rotation: `none` and the identity matrix are
    // the same place, and sub-pixel drift is no motion.
    const matrix = (t) => (t && t !== 'none' ? new DOMMatrixReadOnly(t) : new DOMMatrixReadOnly());
    const turned = (s1, s2) => {
      if (s1 === s2) return false;
      const a = matrix(s1);
      const b = matrix(s2);
      return Math.abs(a.m41 - b.m41) > 1 || Math.abs(a.m42 - b.m42) > 1
        || ['a', 'b', 'c', 'd'].some((k) => Math.abs(a[k] - b[k]) > 0.01);
    };
    const differ = (a, b, boxes) => turned(a.t, b.t)
      || (boxes && (Math.abs(a.x - b.x) > 1 || Math.abs(a.y - b.y) > 1 || Math.abs(a.w - b.w) > 1 || Math.abs(a.h - b.h) > 1));
    // Report what moves, not everything it carries along; spinners and progress bars may move.
    const outermost = (changed) => [...changed].filter((el) => !changed.has(el.parentElement) && !progress(el));
    let tracked = null;

    window.__motion = {
      top: () => scrollTo(0, 0),
      generator: () => document.querySelector('meta[name="generator" i]')?.content?.trim() || null,
      transitions: () => {
        const ms = (list) => list.split(',').map((s) => parseFloat(s) * 1000);
        const found = [];
        const easeIn = new Set();
        const layout = new Set();
        for (const el of ui()) {
          const s = getComputedStyle(el);
          const durations = ms(s.transitionDuration);
          const delays = ms(s.transitionDelay);
          const fns = s.transitionTimingFunction.split(/,(?![^(]*\))/).map((f) => f.trim());
          let best = null;
          let all = false;
          s.transitionProperty.split(',').forEach((p, i) => {
            const prop = p.trim();
            const duration = durations[i % durations.length];
            const time = Math.round(duration + delays[i % delays.length]);
            const fn = fns[i % fns.length];
            if (prop === 'none' || duration <= 0) return;
            if (prop === 'all') all = true;
            if (curve(fn) === 'in') easeIn.add(`${name(el)}: ${prop} ${fn}`);
            if (LAYOUT.test(prop)) layout.add(`${name(el)}: ${prop} ${time} ms`);
            if (!best || time > best.time) best = { time, prop, fn };
          });
          if (best) found.push({ at: name(el), all, kind: curve(best.fn), ...best });
        }
        const times = found.map((t) => t.time).sort((a, b) => a - b);
        const curves = { out: 0, in: 0, 'in-out': 0, ease: 0, linear: 0, steps: 0, spring: 0 };
        for (const t of found) curves[t.kind] += 1;
        const list = (keep, text) => [...new Set(found.filter(keep).map(text))];
        return {
          n: found.length,
          median: times.length ? times[Math.floor(times.length / 2)] : null,
          curves,
          over300: list((t) => t.time > 300, (t) => `${t.at}: ${t.prop} ${t.time} ms`),
          all: list((t) => t.all, (t) => `${t.at}: all ${t.time} ms`),
          easeIn: [...easeIn],
          layout: [...layout],
        };
      },
      entrances: () => {
        const out = new Set();
        for (const { rule, starting } of rules()) {
          if (rule instanceof CSSKeyframeRule && /^(0%|from)$/.test(rule.keyText) && zero(rule.style)) {
            out.add(`@keyframes ${rule.parentRule.name} starts at scale 0`);
          } else if (starting && rule.style && zero(rule.style)) {
            out.add(`${rule.selectorText || rule.parentRule?.parentRule?.selectorText || '?'}: @starting-style at scale 0`);
          }
        }
        for (const a of document.getAnimations()) {
          try {
            const first = a.effect.getKeyframes()[0];
            if (first && first.offset === 0 && zero(first) && a.effect.target) out.add(`${name(a.effect.target)}: first keyframe at scale 0`);
          } catch { /* no keyframes */ }
        }
        return [...out];
      },
      hover: () => {
        const out = new Set();
        for (const { rule, gated } of rules()) {
          if (gated || !(rule instanceof CSSStyleRule) || !onHover(rule.selectorText)) continue;
          const moves = ['transform', 'translate', 'scale', 'rotate'].filter((p) => {
            const v = rule.style.getPropertyValue(p);
            return v && v !== 'none';
          });
          if (moves.length) out.add(`${rule.selectorText} moves (${moves.join(', ')}) outside (hover: hover)`);
        }
        return [...out];
      },
      scroll: () => {
        const html = document.documentElement;
        let timelines = 0;
        let pinned = 0;
        for (const el of document.querySelectorAll('*')) {
          const s = getComputedStyle(el);
          if (s.animationTimeline && s.animationTimeline !== 'auto') timelines += 1;
          // A sticky block in a parent at least half again as tall is held while the page scrolls past it.
          if (s.position === 'sticky' && !el.closest('header, nav, [role="banner"]') && el.parentElement
            && el.parentElement.offsetHeight >= el.offsetHeight * 1.5 && el.offsetHeight > innerHeight / 3) pinned += 1;
        }
        const triggers = window.ScrollTrigger?.getAll?.();
        return {
          takeover: [...html.classList].some((c) => c.startsWith('lenis')) || window.lenis ? 'lenis' : null,
          smooth: getComputedStyle(html).scrollBehavior === 'smooth',
          timelines,
          pinned,
          triggers: triggers ? { n: triggers.length, scrub: triggers.filter((t) => t.vars?.scrub).length, pin: triggers.filter((t) => t.vars?.pin).length } : null,
        };
      },
      // What keeps moving over 600 ms, anywhere on the page: CSS, Web Animations or script alike.
      // Six readings 120 ms apart. Two changes or more mean it passed through a position in between, so it
      // moved; a single change is a jump (a page putting its content in place), not motion. Boxes count
      // only for what is in view: below it, a lazy image loading shifts the layout.
      rest: async (boxes = true) => {
        const els = [...document.body.querySelectorAll('*')];
        const steps = new Map();
        let last = sample(els);
        for (let k = 0; k < 5; k++) {
          await new Promise((done) => setTimeout(done, 120));
          const now = sample(els);
          els.forEach((el, i) => { if (differ(last[i], now[i], boxes && !off(el))) steps.set(el, (steps.get(el) || 0) + 1); });
          last = now;
        }
        const changed = new Set([...steps].filter(([, n]) => n >= 2).map(([el]) => el));
        return outermost(changed).map((el) => ({ at: name(el), off: off(el) }));
      },
      cssLoops: () => document.getAnimations()
        .filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity && a.effect.target && !progress(a.effect.target))
        .filter((a) => a.effect.target.checkVisibility({ opacityProperty: true, visibilityProperty: true }))
        .map((a) => ({ at: name(a.effect.target), off: off(a.effect.target) })),
      // Transforms read at each wheel step: what moves with the scroll.
      track: () => {
        const els = [...document.body.querySelectorAll('*')];
        tracked = { els, last: sample(els), steps: new Map() };
      },
      step: () => {
        const now = sample(tracked.els);
        tracked.els.forEach((el, i) => { if (differ(tracked.last[i], now[i], false)) tracked.steps.set(el, (tracked.steps.get(el) || 0) + 1); });
        tracked.last = now;
      },
      // As at rest, two changes or more: a block that jumps into place once as it is reached is not motion.
      tracked: () => (tracked ? outermost(new Set([...tracked.steps].filter(([, n]) => n >= 2).map(([el]) => el))).map(name) : []),
      // Blocks below the first screen, marked so they can be read again after scrolling.
      mark: () => {
        const blocks = [];
        document.querySelectorAll(BLOCKS).forEach((el, i) => {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height || r.top + scrollY < innerHeight * 1.2) return;
          if (el.closest('nav, header, [aria-hidden="true"], [hidden], dialog:not([open])')) return;
          const up = el.parentElement?.closest('[data-motion-audit]')?.getAttribute('data-motion-audit') ?? null;
          el.setAttribute('data-motion-audit', i);
          blocks.push({ id: String(i), up, at: name(el), faded: opacity(el) < 0.1, move: moved(el) || moved(el.parentElement), clip: getComputedStyle(el).clipPath });
        });
        return blocks;
      },
      blocks: () => Object.fromEntries([...document.querySelectorAll('[data-motion-audit]')].map((el) => [
        el.getAttribute('data-motion-audit'),
        { opacity: opacity(el), move: moved(el) || moved(el.parentElement), clip: getComputedStyle(el).clipPath },
      ])),
      unmark: () => document.querySelectorAll('[data-motion-audit]').forEach((el) => el.removeAttribute('data-motion-audit')),
      moving: () => document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.target && !progress(a.effect.target)).flatMap((a) => {
        let props = [];
        if (a instanceof CSSTransition) props = [a.transitionProperty];
        else {
          try { props = Object.keys(Object.assign({}, ...a.effect.getKeyframes())); } catch { /* no keyframes */ }
        }
        const moves = props.filter((p) => MOVING.test(p));
        return moves.length ? [{ at: name(a.effect.target), props: moves.join(', ') }] : [];
      }),
    };
  };

  const settle = async () => {
    await page.waitForLoadState('load', { timeout: 45000 }).catch(() => { /* a page that never ends loading */ });
    await page.waitForTimeout(1500);
    await page.evaluate(install);
    await page.evaluate(() => window.__motion.top());
    await page.waitForTimeout(200);
  };
  // To the end of the page with the wheel, so scroll libraries see it as a visitor's scroll. The pointer
  // rests on the left edge, so the content passing under it is not hovered.
  const scrollDown = async (track) => {
    await page.mouse.move(4, 450);
    if (track) await page.evaluate(() => window.__motion.track());
    let last = -1;
    for (let i = 0; i < 45; i++) {
      await page.mouse.wheel(0, 700);
      await page.waitForTimeout(250);
      if (track) await page.evaluate(() => window.__motion.step());
      const y = await page.evaluate(() => Math.round(scrollY));
      if (y === last) break;
      last = y;
    }
    await page.waitForTimeout(1200);
    // How far the window really scrolled: 0 means the page scrolls inside its own container.
    return page.evaluate(() => `${Math.round(scrollY)} of ${Math.max(0, document.documentElement.scrollHeight - innerHeight)} px`);
  };
  // Blocks hidden at load and shown after scrolling, each counted once at its outermost hidden block.
  const reveal = (blocks, now) => {
    const state = new Map();
    for (const b of blocks) {
      const n = now[b.id];
      if (!n) continue;
      const byMove = b.move && !n.move;
      const byClip = b.clip !== 'none' && n.clip !== b.clip;
      const shown = (b.faded && n.opacity > 0.9) || byMove || byClip;
      if (shown || b.faded) state.set(b.id, { at: b.at, shown, byMove });
    }
    const byId = new Map(blocks.map((b) => [b.id, b]));
    const inside = (b) => {
      for (let up = b.up; up !== null; up = byId.get(up)?.up ?? null) if (state.has(up)) return true;
      return false;
    };
    const units = blocks.filter((b) => state.has(b.id) && !inside(b)).map((b) => state.get(b.id));
    return { units, below: blocks.filter((b) => b.up === null).length };
  };
  const unique = (list) => [...new Set(list)].slice(0, MAX);

  const report = { url };
  try {
    await page.setViewportSize({ width: 1440, height: 900 });

    // With motion. A new navigation, not a reload: a reload restores the scroll and fires reveals early.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await settle();
    const first = await page.evaluate(async () => {
      const m = window.__motion;
      return {
        generator: m.generator(), transitions: m.transitions(), entrances: m.entrances(), hover: m.hover(),
        scroll: m.scroll(), loops: [...m.cssLoops(), ...(await m.rest())], blocks: m.mark(),
      };
    });
    const depth = await scrollDown(false);
    const after = await page.evaluate(async () => ({
      blocks: window.__motion.blocks(), loops: [...window.__motion.cssLoops(), ...(await window.__motion.rest())],
    }));
    const { units, below } = reveal(first.blocks, after.blocks);
    report.generator = first.generator;
    const { over300, all, easeIn, layout, ...counts } = first.transitions;
    report.transitions = { ...counts, over300: over300.slice(0, MAX), all: all.slice(0, MAX), easeIn: easeIn.slice(0, MAX), layout: layout.slice(0, MAX) };
    report.entrances = first.entrances.slice(0, MAX);
    report.hover = first.hover.slice(0, MAX);
    const shown = units.filter((u) => u.shown);
    report.reveals = {
      below,
      hidden: units.length,
      shown: shown.length,
      share: below ? Math.min(100, Math.round((shown.length / below) * 100)) : 0,
      lost: unique(units.filter((u) => !u.shown).map((u) => u.at)),
      at: unique(shown.map((u) => u.at)),
    };
    report.scroll = { ...first.scroll, depth };
    report.loops = {
      running: unique(first.loops.filter((l) => !l.off).map((l) => l.at)),
      offscreen: unique([...first.loops, ...after.loops].filter((l) => l.off).map((l) => l.at)),
    };

    // With reduced motion: from the moment the document is parsed, at rest, and with the scroll.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.evaluate(install);
    // Transforms only while the page loads: images and fonts arriving shift boxes without any animation.
    const early = await page.evaluate(() => window.__motion.rest(false));
    await settle();
    const still = await page.evaluate(async () => {
      const m = window.__motion;
      return { rest: await m.rest(), animations: m.moving(), takeover: m.scroll().takeover, blocks: m.mark() };
    });
    await scrollDown(true);
    const end = await page.evaluate(async () => ({
      blocks: window.__motion.blocks(), rest: await window.__motion.rest(), scrolled: window.__motion.tracked(),
    }));
    const slid = reveal(still.blocks, end.blocks).units.filter((u) => u.byMove);
    const moving = unique([...early, ...still.rest, ...end.rest].map((l) => l.at));
    report.reduced = {
      moving,
      animations: unique(still.animations.map((a) => `${a.at}: ${a.props}`)),
      scrolled: unique(end.scrolled),
      reveals: unique(slid.map((s) => s.at)),
      takeover: !!still.takeover,
    };

    const found = new Map();
    const add = (at, what) => found.set(at, (found.get(at) || new Set()).add(what));
    for (const l of early) add(l.at, 'moves as the page loads');
    for (const l of [...still.rest, ...end.rest]) add(l.at, 'keeps moving');
    for (const a of still.animations) add(a.at, `animates ${a.props}`);
    for (const at of end.scrolled) add(at, 'moves as the page scrolls');
    for (const s of slid) add(s.at, 'slides in on scroll');
    if (still.takeover) add('html', 'smooth scroll (Lenis) still drives the page');
    report.issues = [...found].slice(0, MAX).map(([at, what]) => ({
      kind: 'reduced-motion', at, rule: 'proof-2', detail: `${[...what].join(', ')} under reduced motion`,
    }));
  } finally {
    await page.evaluate(() => window.__motion?.unmark()).catch(() => { /* page gone */ });
    await page.emulateMedia({ reducedMotion: null });
    if (start) await page.setViewportSize(start);
    // Pages that read prefers-reduced-motion once at load take their normal path again.
    await page.goto(href, { waitUntil: 'load', timeout: 45000 }).catch(() => { /* a page that never ends loading */ });
  }
  report.pass = report.issues.length === 0;
  return report;
}
