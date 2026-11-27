// motion.js · how the open page really moves (design-studio v1, skill `motion`).
// Usage: open the page with browser_navigate, then call browser_run_code_unsafe with
// { "filename": "<path to>/motion.js" }. At 1440 × 900 it loads the page twice and returns:
// With motion:
// - transitions: on what a visitor hovers, presses or opens (controls, what they hold, overlays, what
//   aria-controls points to), the longest transition of each element: how many, the median (delay
//   included), the class of each curve (out, in, in-out, ease, linear, steps, spring for a linear() with
//   stops), and the transitions over 300 ms, on `all`, and on an ease-in curve;
// - entrances: @keyframes, @starting-style rules and running animations that start from a zero scale;
// - hover: :hover rules that move (transform, translate, scale, rotate) outside a (hover: hover) query;
// - reveals: blocks below the first screen hidden at load (opacity, movement, or a clip-path that changes)
//   that show up once the page is scrolled to its end with the wheel, and their share of the blocks below;
// - scroll: a smooth-scroll takeover (Lenis), scroll-behavior: smooth, scroll-driven animations
//   (animation-timeline), GSAP ScrollTrigger instances with scrub and pin, and how far the window scrolled;
// - loops: infinite animations running in the first screen, and those still running once out of view.
// With reduced motion, reloaded:
// - reduced: boxes of the first screen still moving over 600 ms, running animations that move
//   (transform, translate, scale, rotate, top, left, offset), blocks that still slide in on scroll, and a
//   smooth-scroll takeover still active.
// One rule sets pass to false: movement that persists under reduced motion (motion `proof-2`, the
// studio's bar; WCAG 2.3.3 is AAA). Everything else is a finding to judge against the skill's rules.
// It does not see: flashes (WCAG 2.3.1), how motion feels, cross-origin style sheets, menus and dialogs
// once opened, hovers driven by script, pages that scroll inside their own container.
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
    const MOVING = /^(transform|translate|scale|rotate|top|left|right|bottom|offset(-|[A-Z]))/;
    const ZERO = /scale(?:3d|X|Y)?\(\s*0(?:\.0*)?\s*[,)]/;
    const own = (el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${[...el.classList].slice(0, 2).map((c) => `.${c}`).join('')}`;
    // An element with no id or class is named after its nearest ancestor that has one: `svg.logo circle`.
    const name = (el) => {
      if (el.id || el.classList.length) return own(el);
      const anchor = el.parentElement?.closest('[id], [class]');
      return anchor && anchor !== document.body ? `${own(anchor)} ${own(el)}` : own(el);
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

    window.__motion = {
      top: () => scrollTo(0, 0),
      transitions: () => {
        const ms = (list) => list.split(',').map((s) => parseFloat(s) * 1000);
        const found = [];
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
            const time = duration + delays[i % delays.length];
            if (prop === 'none' || duration <= 0) return;
            if (prop === 'all') all = true;
            if (!best || time > best.time) best = { time: Math.round(time), prop, fn: fns[i % fns.length] };
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
          easeIn: list((t) => t.kind === 'in', (t) => `${t.at}: ${t.prop} ${t.fn}`),
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
        for (const el of document.querySelectorAll('*')) {
          const t = getComputedStyle(el).animationTimeline;
          if (t && t !== 'auto') timelines += 1;
        }
        const triggers = window.ScrollTrigger?.getAll?.();
        return {
          takeover: [...html.classList].some((c) => c.startsWith('lenis')) || window.lenis ? 'lenis' : null,
          smooth: getComputedStyle(html).scrollBehavior === 'smooth',
          timelines,
          triggers: triggers ? { n: triggers.length, scrub: triggers.filter((t) => t.vars?.scrub).length, pin: triggers.filter((t) => t.vars?.pin).length } : null,
        };
      },
      loops: () => document.getAnimations()
        .filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity && a.effect.target)
        .map((a) => ({ at: name(a.effect.target), off: off(a.effect.target), seen: a.effect.target.checkVisibility({ opacityProperty: true, visibilityProperty: true }) })),
      // Blocks below the first screen, marked so they can be read again after scrolling.
      mark: () => {
        const blocks = [];
        document.querySelectorAll(BLOCKS).forEach((el, i) => {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height || r.top + scrollY < innerHeight * 1.2) return;
          if (el.closest('nav, header, [aria-hidden="true"], [hidden], dialog:not([open])')) return;
          el.setAttribute('data-motion-audit', i);
          blocks.push({ id: String(i), at: name(el), faded: opacity(el) < 0.1, move: moved(el) || moved(el.parentElement), clip: getComputedStyle(el).clipPath });
        });
        return blocks;
      },
      blocks: () => Object.fromEntries([...document.querySelectorAll('[data-motion-audit]')].map((el) => [
        el.getAttribute('data-motion-audit'),
        { opacity: opacity(el), move: moved(el) || moved(el.parentElement), clip: getComputedStyle(el).clipPath },
      ])),
      unmark: () => document.querySelectorAll('[data-motion-audit]').forEach((el) => el.removeAttribute('data-motion-audit')),
      // With reduced motion: boxes of the first screen read twice, 600 ms apart.
      stillMoving: async () => {
        const els = [...document.body.querySelectorAll('*')].filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 1 && r.height > 1 && r.top < innerHeight && r.bottom > 0;
        });
        const before = els.map((el) => el.getBoundingClientRect());
        await new Promise((done) => setTimeout(done, 600));
        const changed = new Set(els.filter((el, i) => {
          const a = before[i];
          const b = el.getBoundingClientRect();
          return Math.abs(a.x - b.x) > 1 || Math.abs(a.y - b.y) > 1 || Math.abs(a.width - b.width) > 1 || Math.abs(a.height - b.height) > 1;
        }));
        // Report what moves, not everything it carries along.
        return [...new Set([...changed].filter((el) => !changed.has(el.parentElement)).map(name))];
      },
      moving: () => document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.target).flatMap((a) => {
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

  const load = async (reducedMotion) => {
    await page.emulateMedia({ reducedMotion });
    // A new navigation, not a reload: a reload restores the scroll position and fires the reveals early.
    await page.goto(url, { waitUntil: 'load', timeout: 45000 }).catch(() => { /* a page that never ends loading */ });
    await page.waitForTimeout(1500);
    await page.evaluate(install);
    await page.evaluate(() => window.__motion.top());
    await page.waitForTimeout(200);
  };
  // To the end of the page with the wheel, so scroll libraries see it as a visitor's scroll.
  const scrollDown = async () => {
    await page.mouse.move(720, 450);
    let last = -1;
    for (let i = 0; i < 45; i++) {
      await page.mouse.wheel(0, 700);
      await page.waitForTimeout(250);
      const y = await page.evaluate(() => Math.round(scrollY));
      if (y === last) break;
      last = y;
    }
    await page.waitForTimeout(1200);
    // How far the window really scrolled: 0 means the page scrolls inside its own container.
    return page.evaluate(() => `${Math.round(scrollY)} of ${Math.max(0, document.documentElement.scrollHeight - innerHeight)} px`);
  };
  // Blocks hidden at load and shown after scrolling.
  const revealed = (blocks, now) => blocks.flatMap((b) => {
    const n = now[b.id];
    if (!n) return [];
    const byOpacity = b.faded && n.opacity > 0.9;
    const byMove = b.move && !n.move;
    const byClip = b.clip !== 'none' && n.clip !== b.clip;
    return byOpacity || byMove || byClip ? [{ at: b.at, byMove, byClip }] : [];
  });
  const unique = (list) => [...new Set(list)].slice(0, MAX);

  const report = { url };
  try {
    await page.setViewportSize({ width: 1440, height: 900 });

    // With motion.
    await load('no-preference');
    const first = await page.evaluate(() => {
      const m = window.__motion;
      return { transitions: m.transitions(), entrances: m.entrances(), hover: m.hover(), scroll: m.scroll(), loops: m.loops(), blocks: m.mark() };
    });
    const depth = await scrollDown();
    const after = await page.evaluate(() => ({ blocks: window.__motion.blocks(), loops: window.__motion.loops() }));
    const shown = revealed(first.blocks, after.blocks);
    const { over300, all, easeIn, ...counts } = first.transitions;
    report.transitions = { ...counts, over300: over300.slice(0, MAX), all: all.slice(0, MAX), easeIn: easeIn.slice(0, MAX) };
    report.entrances = first.entrances.slice(0, MAX);
    report.hover = first.hover.slice(0, MAX);
    report.reveals = {
      below: first.blocks.length,
      hidden: first.blocks.filter((b) => b.faded || b.move).length + shown.filter((s) => s.byClip).length,
      shown: shown.length,
      share: first.blocks.length ? Math.round((shown.length / first.blocks.length) * 100) : 0,
      at: unique(shown.map((s) => s.at)),
    };
    report.scroll = { ...first.scroll, depth };
    report.loops = {
      running: unique(first.loops.filter((l) => l.seen && !l.off).map((l) => l.at)),
      offscreen: unique(after.loops.filter((l) => l.off).map((l) => l.at)),
    };

    // With reduced motion.
    await load('reduce');
    const still = await page.evaluate(async () => {
      const m = window.__motion;
      return { moving: await m.stillMoving(), animations: m.moving(), takeover: m.scroll().takeover, blocks: m.mark() };
    });
    await scrollDown();
    const slid = revealed(still.blocks, await page.evaluate(() => window.__motion.blocks())).filter((s) => s.byMove);
    report.reduced = {
      moving: still.moving.slice(0, MAX),
      animations: unique(still.animations.map((a) => `${a.at}: ${a.props}`)),
      reveals: unique(slid.map((s) => s.at)),
      takeover: !!still.takeover,
    };

    const found = new Map();
    const add = (at, what) => found.set(at, (found.get(at) || new Set()).add(what));
    for (const at of still.moving) add(at, 'moves');
    for (const a of still.animations) add(a.at, `animates ${a.props}`);
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
