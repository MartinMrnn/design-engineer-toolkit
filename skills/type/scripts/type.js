// type.js · what the type of the open page really is (design-studio v1, skill `type`).
// Usage: open the page with browser_navigate, then call browser_run_code_unsafe with
// { "filename": "<path to>/type.js" }. The page decides the mode:
// - board, when it has [data-candidate="Name"] (from assets/board.html): for each candidate, whether its
//   faces loaded, x-height, cap height and average width per em (its text face at 16 px, its headline
//   face at 96 px in `display`, each in the weight it is set in), weights declared, faux bold, and the
//   characters of <body data-chars="…"> it lacks (French by default). No verdict: the user chooses by eye.
// - audit, on any other page: faces, sizes, weights, leading, real characters per line of long text,
//   whether text follows the root font size, fluid sizes, faux bold or italic. Only two standards set
//   pass to false: text must reach 200 % by the browser's 500 % zoom without leaving the screen
//   (WCAG 1.4.4), and the WCAG text-spacing values must clip nothing (WCAG 1.4.12).
// It does not see: text in images, menus or dialogs once opened, or whether a face is beautiful.
async (page) => {
  const WIDTHS = [1440, 1024, 768, 390, 320];
  const MAX_PER_KIND = 10;
  const url = page.url().split('#')[0];
  const start = page.viewportSize();
  await page.evaluate(() => document.fonts.ready.then(() => true));

  if (await page.evaluate(() => Boolean(document.querySelector('[data-candidate]')))) {
    const candidates = await page.evaluate(async () => {
      const FRENCH = 'àâæçéèêëîïôœùûüÿÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸ«»’…–—€\u00a0\u202f';
      const chars = [...(document.body.dataset.chars || FRENCH)];
      const ctx = document.createElement('canvas').getContext('2d');
      const clean = (name) => name.replace(/["']/g, '').trim();
      const weightOf = (w) => w.replace('normal', '400').replace('bold', '700');
      const out = [];
      const familyOf = (node) => clean(getComputedStyle(node).fontFamily.split(',')[0]);
      const facesOf = (family) => [...document.fonts].filter((f) => clean(f.family) === family);
      const heaviest = (f) => parseInt(weightOf(f.weight).split(' ').pop(), 10);
      const show = (c) => (/\s/.test(c) ? `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}` : c);
      // An optical axis redraws the letters with the size, and a weight changes them too.
      const metrics = (node, size) => {
        ctx.font = `${getComputedStyle(node).fontWeight} ${size}px "${familyOf(node)}", serif`;
        return {
          xHeight: +(ctx.measureText('x').actualBoundingBoxAscent / size).toFixed(3),
          capHeight: +(ctx.measureText('H').actualBoundingBoxAscent / size).toFixed(3),
          avgWidth: +(ctx.measureText('abcdefghijklmnopqrstuvwxyz').width / (26 * size)).toFixed(3),
        };
      };
      for (const el of document.querySelectorAll('[data-candidate]')) {
        // What the candidate really sets: each face and weight, except its printed label.
        const nodes = [...el.querySelectorAll('*')].filter((n) => !n.matches('.name') && n.textContent.trim());
        const pairs = [...new Map(nodes.map((n) => {
          const pair = { family: familyOf(n), weight: getComputedStyle(n).fontWeight };
          return [`${pair.family}|${pair.weight}`, pair];
        })).values()].filter(({ family }) => facesOf(family).length);
        for (const { family, weight } of pairs) await document.fonts.load(`${weight} 40px "${family}"`, `Hx${chars.join('')}`).catch(() => {});
        const families = [...new Set(pairs.map((p) => p.family))];
        const entry = { name: el.dataset.candidate, loaded: families.length > 0 && families.every((f) => facesOf(f).some((x) => x.status === 'loaded')), xHeight: null, capHeight: null, avgWidth: null, display: null, weights: [], missing: null, fauxBold: false };
        if (entry.loaded) {
          const text = el.querySelector('.text') || el.querySelector('p:not(.name)') || el;
          const head = el.querySelector('h1') || el.querySelector('h2') || el;
          Object.assign(entry, metrics(text, 16));
          entry.display = metrics(head, 96);
          entry.weights = [...new Set(facesOf(familyOf(head)).filter((f) => f.status !== 'error').map((f) => weightOf(f.weight)))].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
          // A glyph the face lacks falls through to the generic, so its width changes with the generic.
          const width = (c, { family, weight }, generic) => {
            ctx.font = `${weight} 100px "${family}", ${generic}`;
            return ctx.measureText(c).width;
          };
          entry.missing = chars.filter((c) => pairs.some((p) => Math.abs(width(c, p, 'monospace') - width(c, p, 'serif')) > 0.01)).map(show).join('');
          entry.fauxBold = pairs.some(({ family, weight }) => Number(weight) >= 600 && facesOf(family).every((f) => heaviest(f) < 600));
        }
        out.push(entry);
      }
      return out;
    });
    return { mode: 'board', url, candidates };
  }

  const sizesAt = async (width) => {
    await page.setViewportSize({ width, height: 900 });
    return page.evaluate(() => window.__type.els.map((el) => parseFloat(getComputedStyle(el).fontSize)));
  };

  try {
    await page.setViewportSize({ width: 1440, height: 900 });
    const report = await page.evaluate(() => {
      const describe = (el) => {
        const classes = typeof el.className === 'string' ? el.className.split(/\s+/).filter(Boolean) : [];
        return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${classes.map((name) => `.${name}`).join('')}`;
      };
      const counts = new Map();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const el = walker.currentNode.parentElement;
        const chars = walker.currentNode.textContent.replace(/\s+/g, ' ').trim().length;
        if (!chars || !el || el.closest('script,style,noscript,svg,pre,code,template')) continue;
        const box = el.getBoundingClientRect();
        // A box of 1 px is text for screen readers only.
        if (box.width <= 1 || box.height <= 1 || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
        counts.set(el, (counts.get(el) || 0) + chars);
      }
      const els = [...counts.keys()];
      window.__type = { els, describe };
      // Text past the viewport's edges; a scroller or a clipping box is judged by check.js instead.
      window.__type.off = () => els.flatMap((el, i) => {
        if (!el.isConnected || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return [];
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          if (getComputedStyle(p).overflowX !== 'visible') return [];
        }
        const range = document.createRange();
        const texts = [...el.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
        return texts.some((node) => {
          range.selectNode(node);
          return [...range.getClientRects()].some((r) => r.width && (r.right > innerWidth + 1 || r.left < -1));
        }) ? [i] : [];
      });
      const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1;
      const clean = (name) => name.replace(/["']/g, '').trim();
      const declared = [...document.fonts].filter((f) => f.status !== 'error');
      const faceOf = (stack) => {
        const names = stack.split(',').map(clean);
        return names.find((n) => declared.some((f) => clean(f.family) === n && f.status === 'loaded')) || names[0];
      };
      const number = (w) => (w === 'normal' ? 400 : w === 'bold' ? 700 : Number(w));
      const top = (w) => number(w.split(' ').pop());
      const tally = (key) => {
        const map = new Map();
        for (const el of els) map.set(key(el), (map.get(key(el)) || 0) + counts.get(el));
        return [...map].filter(([, n]) => n / total >= 0.005).sort((a, b) => b[1] - a[1]);
      };
      const style = (el) => getComputedStyle(el);
      const sizes = tally((el) => parseFloat(style(el).fontSize)).map(([size]) => size);
      const leading = sizes.map((size) => {
        const [value] = tally((el) => (parseFloat(style(el).fontSize) === size && style(el).lineHeight !== 'normal' ? +(parseFloat(style(el).lineHeight) / size).toFixed(2) : 'none')).filter(([v]) => v !== 'none')[0] || [null];
        return { size, value };
      }).sort((a, b) => a.size - b.size);

      const fauxBold = new Set();
      for (const el of els) {
        const s = style(el);
        const own = declared.filter((f) => clean(f.family) === faceOf(s.fontFamily));
        if (!own.length) continue;
        const bold = Number(s.fontWeight) >= 600 && s.fontSynthesisWeight !== 'none' && own.every((f) => top(f.weight) < 600);
        const slanted = s.fontStyle !== 'normal' && s.fontSynthesisStyle !== 'none' && own.every((f) => f.style === 'normal');
        if (bold || slanted) fauxBold.add(describe(el));
      }

      const linesOf = (el) => {
        const size = parseFloat(style(el).fontSize);
        const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const range = document.createRange();
        const lines = [];
        let top = null;
        while (tw.nextNode()) {
          const node = tw.currentNode;
          for (let i = 0; i < node.length; i++) {
            range.setStart(node, i);
            range.setEnd(node, i + 1);
            const rect = range.getClientRects()[0];
            if (!rect || !rect.width) continue;
            if (top === null || Math.abs(rect.top - top) > size * 0.6) {
              lines.push(0);
              top = rect.top;
            }
            lines[lines.length - 1]++;
          }
        }
        return lines;
      };
      window.__type.measure = () => {
        const per = [];
        for (const el of document.querySelectorAll('p, li, blockquote, dd')) {
          if (el.textContent.trim().length < 120 || !el.checkVisibility() || el.querySelector('p, li, blockquote, dd')) continue;
          const lines = linesOf(el);
          if (lines.length < 3) continue;
          const full = lines.slice(0, -1).sort((a, b) => a - b);
          per.push({ at: describe(el), chars: full[Math.floor(full.length / 2)] });
        }
        const ordered = per.map((p) => p.chars).sort((a, b) => a - b);
        return per.length ? {
          n: per.length,
          min: ordered[0],
          median: ordered[Math.floor(ordered.length / 2)],
          max: ordered[ordered.length - 1],
          outside: [...new Set(per.filter((p) => p.chars < 60 || p.chars > 85).map((p) => p.at))],
        } : null;
      };
      const measure = window.__type.measure();

      const main = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0];
      const before = main ? parseFloat(style(main).fontSize) : 0;
      const probe = document.createElement('style');
      probe.textContent = 'html{font-size:200% !important}';
      document.head.append(probe);
      const followsRoot = main ? parseFloat(style(main).fontSize) >= before * 1.9 : false;
      probe.remove();

      return {
        faces: tally((el) => faceOf(style(el).fontFamily)).map(([name, n]) => ({ name, share: +(n / total).toFixed(3) })),
        sizes: [...sizes].sort((a, b) => a - b),
        weights: tally((el) => Number(style(el).fontWeight)).map(([w]) => w).sort((a, b) => a - b),
        leading,
        measure,
        followsRoot,
        fauxBold: [...fauxBold].slice(0, 10),
      };
    });

    const names = await page.evaluate(() => window.__type.els.map((el) => window.__type.describe(el)));
    const issues = [];

    // The 60 to 85 range is for wide screens; a phone's line is reported with no verdict.
    if (report.measure) {
      await page.setViewportSize({ width: 390, height: 900 });
      const phone = await page.evaluate(() => window.__type.measure());
      report.measure.phone = phone && { n: phone.n, min: phone.min, median: phone.median, max: phone.max };
    }

    // Fluid: the size keeps changing across three widths with no layout breakpoint between them.
    const at = {};
    for (const width of [...WIDTHS, 1000, 1100, 1200]) at[width] = await sizesAt(width);
    const fluid = new Map();
    names.forEach((name, i) => {
      const [a, b, c] = [at[1000][i], at[1100][i], at[1200][i]];
      if (!(at[320][i] > 0 && at[1440][i] > 0) || !((a < b && b < c) || (a > b && b > c)) || fluid.has(name)) return;
      fluid.set(name, { at: name, min: at[320][i], max: at[1440][i], ratio: +(at[1440][i] / at[320][i]).toFixed(2) });
    });

    // WCAG 1.4.4: at a zoom of z the CSS viewport is W / z and every CSS pixel is drawn z times larger.
    // Text must reach 200 % at some zoom up to the browser's 500 %, and still be on screen when it does.
    // On phone widths only the size is judged: 200 % leaves under 200 CSS pixels, below what reflow asks.
    const failed = new Set();
    const flag = (name, detail) => {
      if (failed.has(name)) return;
      failed.add(name);
      if (failed.size <= MAX_PER_KIND) issues.push({ kind: 'resize', at: name, rule: 'WCAG 1.4.4', detail });
    };
    const offAt = (width) => (width >= 768 ? page.evaluate(() => window.__type.off()) : []);
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      const wasOff = new Set(await offAt(width));
      const open = new Set(names.map((_, i) => i).filter((i) => at[width][i] > 0));
      let zoomed = [];
      for (const zoom of [2, 2.5, 3, 4, 5]) {
        if (!open.size) break;
        zoomed = await sizesAt(Math.round(width / zoom));
        const off = new Set(await offAt(width));
        for (const i of [...open]) {
          // A page that re-renders on resize detaches elements: their size is NaN and proves nothing.
          if (!(zoomed[i] > 0)) open.delete(i);
          else if (zoom * zoomed[i] + 0.5 >= 2 * at[width][i]) {
            open.delete(i);
            if (off.has(i) && !wasOff.has(i)) flag(names[i], `leaves the screen at ${zoom * 100} % zoom from ${width} px, where it reaches 200 %`);
          }
        }
      }
      for (const i of open) flag(names[i], `${at[width][i]}px at ${width} px reaches ${+(5 * zoomed[i]).toFixed(1)}px at 500 % zoom, under the ${2 * at[width][i]}px needed`);
    }

    // WCAG 1.4.12: only what the spacing newly clips counts; a box already truncating is not its fault.
    const clipped = new Set();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const found = await page.evaluate(() => {
        const over = (el) => {
          const s = getComputedStyle(el);
          if (s.textOverflow === 'ellipsis' || s.webkitLineClamp !== 'none') return false; // truncated on purpose
          const hides = (value) => value === 'hidden' || value === 'clip';
          return (hides(s.overflowX) && el.scrollWidth > el.clientWidth + 1) || (hides(s.overflowY) && el.scrollHeight > el.clientHeight + 1);
        };
        const boxes = [...document.body.querySelectorAll('*')].filter((el) => el.clientWidth && el.clientHeight && el.textContent.trim());
        const already = new Set(boxes.filter(over));
        const spacing = document.createElement('style');
        spacing.textContent = '*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}';
        document.head.append(spacing);
        const fresh = boxes.filter((el) => !already.has(el) && over(el)).map((el) => window.__type.describe(el));
        spacing.remove();
        return fresh;
      });
      for (const name of found) {
        if (clipped.has(name)) continue;
        clipped.add(name);
        if (clipped.size <= MAX_PER_KIND) issues.push({ kind: 'text-spacing', at: name, rule: 'WCAG 1.4.12', detail: `clipped at ${width} px with the WCAG text-spacing values` });
      }
    }

    return { mode: 'audit', url, pass: issues.length === 0, ...report, fluid: [...fluid.values()], issues };
  } finally {
    if (start) await page.setViewportSize(start);
  }
}
