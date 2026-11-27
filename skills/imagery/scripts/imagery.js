// imagery.js · what the imagery, shadows and effects of the open page really are (design-studio v1, skill `imagery`).
// Usage: open the page with browser_navigate, then call browser_run_code_unsafe with
// { "filename": "<path to>/imagery.js" }. With reduced motion, at 1440 × 900 and 390 × 844, it returns:
// - visuals: the share of the first screen covered by a visual (img, video, canvas, iframe, svg, CSS image,
//   at least 160 × 120, by rectangle so a canvas with pointer-events: none counts, each point given to the
//   smallest visual over it) and its kinds;
// - images: images at least 80 px wide that reserve no space (no aspect ratio, not absolutely placed),
//   blurry (fewer image pixels than CSS pixels shown), soft (under 2x), heavy (over 3x), lazy in the first
//   screen, and how many have an outline or border. Vectors skip resolution;
// - contrast: each text over an image, video, canvas, CSS image or gradient (its box meets the visual, or a
//   background on the way to its first opaque ground), at most 40 per width. Text is made transparent,
//   its box captured and its pixels decoded in the page; the ratio kept is the worst 5 % of pixels against
//   the text colour. Text on a flat ground of its own, in front of the visuals, is left to axe. The 20
//   lowest are listed;
// - unmeasured: texts over a visual that were not measured: blended (mix-blend-mode), or covered or clipped
//   (an opaque element above it at the centre of the text, pointer-events ignored). Text in a box under
//   4 px, such as .sr-only, is left out; a video under the text that shows no frame after 2 s is listed too;
// At 1440 only, the whole page:
// - shapes: empty absolute or fixed elements and pseudo-elements, filled, at least 4000 px², round
//   (radius 30 % of a short side of 80 px or more) or blurred (blur 20 px or more): shapes standing in for
//   an image;
// - shadows: distinct outer box-shadow values (rings left out), with neutral or tinted colour and alpha;
//   mixed when offsets point both ways on one axis; lost when a dark neutral shadow sits on a dark ground
//   with no light ring and no surface lighter than the ground;
// - glass: backdrop-filter elements, their blur, glass inside glass, and whether a readable style sheet
//   has a prefers-reduced-transparency rule; gradients: how many, how many cover a quarter of the screen;
// - textures: feTurbulence, backgrounds named noise, grain or texture, blended layers over half the screen.
// One standard sets pass to false: text over a visual under 4.5:1, or 3:1 when large (WCAG 1.4.3).
// It does not see: text opacity or gradient-filled text, a fixed header over the captured box, frames of
// a video other than the one captured, whether an image fits the project, or whether the finish is good.
async (page) => {
  const SIZES = [[1440, 900], [390, 844]];
  const MAX = 10;
  const MAX_TEXT = 40;
  const url = page.url().split('#')[0];
  const start = page.viewportSize();
  const frame = () => page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));

  await page.evaluate(() => {
    const cs = (el, pseudo) => getComputedStyle(el, pseudo);
    const shown = (el) => {
      const s = cs(el);
      const r = el.getBoundingClientRect();
      return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && r.width > 1 && r.height > 1
        && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    };
    const name = (el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${[...el.classList].slice(0, 2).map((c) => `.${c}`).join('')}`;
    const describe = (el) => {
      const file = el.tagName === 'IMG' && !el.currentSrc.startsWith('data:') ? el.currentSrc.split(/[?#]/)[0].split('/').pop() : '';
      const label = (el.getAttribute('aria-label') || el.getAttribute('alt') || el.textContent || file || '').trim().replace(/\s+/g, ' ').slice(0, 30);
      return `${name(el)}${label ? ` "${label}"` : ''}`;
    };
    const alpha = (color) => {
      if (!color || color === 'transparent') return 0;
      const slash = color.match(/\/\s*([\d.]+)(%?)\s*\)$/);
      if (slash) return slash[2] ? slash[1] / 100 : +slash[1];
      const rgba = color.match(/^rgba\((?:[^,]+,){3}\s*([\d.]+)\)$/);
      return rgba ? +rgba[1] : 1;
    };
    // Any CSS colour as opaque sRGB 0-255, through relative colour syntax.
    const probe = document.createElement('i');
    probe.style.display = 'none';
    document.body.append(probe);
    const srgb = (color) => {
      probe.style.color = `rgb(from ${color} r g b)`;
      const value = cs(probe).color;
      const n = (value.match(/-?[\d.]+(e-?\d+)?/g) || ['0', '0', '0']).map(Number);
      return value.startsWith('color(') ? n.slice(0, 3).map((x) => x * 255) : n.slice(0, 3);
    };
    const lum = ([r, g, b]) => {
      const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    };
    const all = () => [...document.querySelectorAll('body *')].filter((el) => !(el.closest('svg') && el.tagName.toLowerCase() !== 'svg'));
    const meets = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
    const imageBg = (s) => s.backgroundImage.includes('url(') || s.backgroundImage.includes('gradient');

    const visuals = () => all().flatMap((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 160 || r.height < 120 || !shown(el)) return [];
      const tag = el.tagName.toLowerCase();
      if (['img', 'video', 'canvas', 'iframe', 'svg'].includes(tag)) return [{ el, r, kind: tag }];
      const bg = cs(el).backgroundImage;
      if (bg.includes('url(')) return [{ el, r, kind: 'css image' }];
      if (bg.includes('gradient')) return [{ el, r, kind: 'gradient' }];
      return [];
    });

    const firstScreen = (vis) => {
      const kinds = {};
      let hit = 0;
      const n = 24 * 15;
      for (let i = 0; i < 24; i++) for (let j = 0; j < 15; j++) {
        const x = ((i + 0.5) / 24) * innerWidth;
        const y = ((j + 0.5) / 15) * innerHeight;
        // The smallest visual under the point: a card over a faint full-width drawing is the card.
        const v = vis.filter((v) => v.kind !== 'gradient' && x >= v.r.left && x <= v.r.right && y >= v.r.top && y <= v.r.bottom)
          .sort((a, b) => a.r.width * a.r.height - b.r.width * b.r.height)[0];
        if (v) { hit++; kinds[v.kind] = (kinds[v.kind] || 0) + 1; }
      }
      return { share: Math.round((hit / n) * 100), kinds: Object.entries(kinds).sort((a, b) => b[1] - a[1]).map(([k, c]) => `${k} ${Math.round((c / n) * 100)} %`) };
    };

    const images = () => {
      const out = { n: 0, unsized: [], blurry: [], soft: [], heavy: [], lazyFirst: [], outlined: 0 };
      for (const img of document.images) {
        const r = img.getBoundingClientRect();
        if (r.width < 80 || !shown(img)) continue;
        out.n++;
        const s = cs(img);
        if (s.aspectRatio === 'auto' && !/absolute|fixed/.test(s.position)) out.unsized.push(describe(img));
        const vector = /\.svg([?#]|$)/i.test(img.currentSrc) || img.currentSrc.startsWith('data:image/svg');
        if (!vector && img.naturalWidth && img.naturalHeight) {
          const fit = s.objectFit;
          const scale = fit === 'cover' ? Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight)
            : fit === 'contain' ? Math.min(r.width / img.naturalWidth, r.height / img.naturalHeight) : r.width / img.naturalWidth;
          const density = 1 / scale;
          if (density < 0.95) out.blurry.push(`${describe(img)} ${img.naturalWidth} px shown ${Math.round(r.width)}`);
          else if (density < 2) out.soft.push(`${describe(img)} ${density.toFixed(1)}x`);
          else if (density > 3) out.heavy.push(`${describe(img)} ${density.toFixed(1)}x`);
        }
        if (img.loading === 'lazy' && r.top < innerHeight && r.bottom > 0) out.lazyFirst.push(describe(img));
        if ((s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || parseFloat(s.borderTopWidth) > 0) out.outlined++;
      }
      return out;
    };

    // Text over a visual: each element with its own text, its text box, its colour and size.
    let texts = [];
    const candidates = (vis, max) => {
      texts = [];
      const out = [];
      for (const el of all()) {
        if (out.length >= max) break;
        if (el.closest('script, style, noscript, template, [aria-hidden="true"], [inert]') || !shown(el)) continue;
        const nodes = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
        if (!nodes.length) continue;
        const s = cs(el);
        if (alpha(s.color) < 0.1 || s.webkitTextFillColor === 'rgba(0, 0, 0, 0)') continue;
        const rects = nodes.flatMap((n) => { const range = document.createRange(); range.selectNodeContents(n); return [...range.getClientRects()]; }).filter((r) => r.width > 0 && r.height > 0);
        if (!rects.length) continue;
        const box = { left: Math.min(...rects.map((r) => r.left)), right: Math.max(...rects.map((r) => r.right)), top: Math.min(...rects.map((r) => r.top)), bottom: Math.max(...rects.map((r) => r.bottom)) };
        const own = el.getBoundingClientRect();
        if (own.width < 4 || own.height < 4) continue; // visually hidden text, such as .sr-only
        const under = vis.filter((v) => v.el !== el && !el.contains(v.el) && meets(v.r, box));
        // solid: the text has a flat ground of its own in front of the visuals, which axe can judge.
        let over = under.length > 0;
        let solid = false;
        for (let a = el; a; a = a.parentElement) {
          const as = cs(a);
          if (imageBg(as)) { over = true; break; }
          if (alpha(as.backgroundColor) >= 0.9) { solid = !under.some((v) => a.contains(v.el)); break; }
        }
        if (!over) continue;
        const size = parseFloat(s.fontSize);
        let blend = '';
        for (let a = el; !blend && a; a = a.parentElement) if (cs(a).mixBlendMode !== 'normal') blend = cs(a).mixBlendMode;
        texts.push({ el, nodes });
        out.push({ at: describe(el), color: srgb(s.color), large: size >= 24 || (size >= 18.66 && +s.fontWeight >= 700), blend, solid });
      }
      return out;
    };
    const textBox = (i) => {
      const { el, nodes } = texts[i];
      el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
      const rects = nodes.flatMap((n) => { const range = document.createRange(); range.selectNodeContents(n); return [...range.getClientRects()]; }).filter((r) => r.width > 0 && r.height > 0);
      if (!rects.length) return null;
      const left = Math.max(0, Math.min(...rects.map((r) => r.left)));
      const top = Math.max(0, Math.min(...rects.map((r) => r.top)));
      const right = Math.min(innerWidth, Math.max(...rects.map((r) => r.right)));
      const bottom = Math.min(innerHeight, Math.max(...rects.map((r) => r.bottom)));
      if (right - left < 2 || bottom - top < 2) return null;
      // Text clipped by its container or under an opaque element is not what people see there. The text is
      // made hit-testable for this one test, so a label with pointer-events: none still counts; forcing it
      // on the whole page would wake hover states.
      const [value, priority] = [el.style.getPropertyValue('pointer-events'), el.style.getPropertyPriority('pointer-events')];
      el.style.setProperty('pointer-events', 'auto', 'important');
      const stack = document.elementsFromPoint((left + right) / 2, (top + bottom) / 2);
      if (value) el.style.setProperty('pointer-events', value, priority); else el.style.removeProperty('pointer-events');
      const opaque = (hit) => {
        const hs = cs(hit);
        if (+hs.opacity < 0.9 || hs.mixBlendMode !== 'normal') return false; // a grain or tint layer does not hide the text
        return ['IMG', 'VIDEO', 'CANVAS', 'IFRAME'].includes(hit.tagName) || alpha(hs.backgroundColor) >= 0.9 || hs.backgroundImage.includes('url(');
      };
      const at = stack.findIndex((hit) => el.contains(hit) || hit.contains(el));
      const cover = stack.slice(0, at < 0 ? stack.length : at).find(opaque);
      if (at < 0 || cover) return { covered: cover ? name(cover) : 'nothing' };
      // A video under the text with no frame yet would be measured as an empty ground.
      const below = stack.slice(at).find((hit) => !hit.contains(el) && opaque(hit));
      texts[i].video = below && below.tagName === 'VIDEO' ? below : null;
      return { x: left, y: top, width: right - left, height: bottom - top, video: !!texts[i].video };
    };
    const framed = (i) => !texts[i].video || texts[i].video.readyState >= 2;
    const hideText = (on) => {
      let style = document.getElementById('__imagery-hide');
      if (on && !style) {
        style = document.createElement('style');
        style.id = '__imagery-hide';
        style.textContent = '* { color: transparent !important; -webkit-text-fill-color: transparent !important; text-decoration-color: transparent !important; caret-color: transparent !important; }';
        document.head.append(style);
      }
      if (!on && style) style.remove();
    };

    const shapes = () => {
      const out = [];
      const check = (el, pseudo) => {
        const s = cs(el, pseudo);
        if (!/absolute|fixed/.test(s.position) || s.display === 'none' || s.visibility === 'hidden' || +s.opacity <= 0.05) return;
        if (pseudo && !['""', '" "'].includes(s.content)) return;
        if (s.backgroundImage.includes('url(') || !(alpha(s.backgroundColor) > 0 || s.backgroundImage.includes('gradient'))) return;
        let w;
        let h;
        if (pseudo) { w = parseFloat(s.width); h = parseFloat(s.height); } else { const r = el.getBoundingClientRect(); w = r.width; h = r.height; }
        if (!(w * h >= 4000)) return;
        const raw = s.borderTopLeftRadius;
        const radius = raw.endsWith('%') ? (parseFloat(raw) / 100) * Math.min(w, h) : parseFloat(raw) || 0;
        const blur = s.filter.match(/blur\(([\d.]+)px\)/);
        const round = radius >= 0.3 * Math.min(w, h) && Math.min(w, h) >= 80; // a pill behind a tab is not a blob
        const blurred = blur && +blur[1] >= 20;
        if (!round && !blurred) return;
        out.push(`${pseudo ? name(el) + pseudo : name(el)} ${Math.round(w)}×${Math.round(h)} ${[round && 'round', blurred && blur[0]].filter(Boolean).join(' ')}`);
      };
      for (const el of all()) {
        if (out.length >= 10) break;
        if (el.closest('a, button, input, select, textarea, label, [role="button"]')) continue;
        const empty = !el.textContent.trim() && !el.querySelector('img, svg, video, canvas, picture, iframe') && !['img', 'svg', 'video', 'canvas', 'picture', 'iframe', 'input'].includes(el.tagName.toLowerCase());
        if (empty) check(el);
        check(el, '::before');
        check(el, '::after');
      }
      return out;
    };

    const layers = (value) => {
      const out = [];
      let depth = 0;
      let cur = '';
      for (const ch of value) {
        if (ch === '(') depth++;
        if (ch === ')') depth--;
        if (ch === ',' && !depth) { out.push(cur.trim()); cur = ''; } else cur += ch;
      }
      if (cur.trim()) out.push(cur.trim());
      return out;
    };
    const ground = (el) => {
      for (let a = el.parentElement; a; a = a.parentElement) {
        const bg = cs(a).backgroundColor;
        if (alpha(bg) >= 0.9) return srgb(bg);
      }
      return [255, 255, 255];
    };
    const shadows = () => {
      const values = new Map();
      const signs = { x: new Set(), y: new Set() };
      const lost = [];
      for (const el of all()) {
        const s = cs(el);
        if (s.boxShadow === 'none' || !shown(el)) continue;
        const parsed = layers(s.boxShadow).map((l) => {
          const colour = (l.match(/(rgba?|hsla?|oklch|oklab|lab|lch|color)\([^)]*\)/) || ['black'])[0];
          const [x = 0, y = 0, blur = 0, spread = 0] = l.replace(colour, '').replace('inset', '').trim().split(/\s+/).map(parseFloat);
          const rgb = srgb(colour);
          return { inset: l.includes('inset'), x, y, blur, spread, a: alpha(colour), neutral: Math.max(...rgb) - Math.min(...rgb) <= 10, dark: lum(rgb) < 0.05 };
        });
        const outer = parsed.filter((l) => !l.inset && (l.blur > 0 || l.x || l.y));
        if (!outer.length) continue;
        // On a dark ground, a light ring or a surface lighter than the ground does the shadow's job.
        const ring = parsed.some((l) => !l.dark && (l.inset || (!l.blur && !l.x && !l.y && l.spread > 0)));
        const lighter = alpha(s.backgroundColor) >= 0.9 && (lum(srgb(s.backgroundColor)) + 0.05) / (lum(ground(el)) + 0.05) >= 1.04;
        const key = outer.map((l) => `${l.x} ${l.y} ${l.blur} ${l.neutral ? 'neutral' : 'tinted'}/${+l.a.toFixed(2)}`).join(', ');
        values.set(key, (values.get(key) || 0) + 1);
        for (const l of outer) { if (l.x) signs.x.add(Math.sign(l.x)); if (l.y) signs.y.add(Math.sign(l.y)); }
        if (lost.length < 10 && !ring && !lighter && outer.every((l) => l.neutral && l.dark) && lum(ground(el)) < 0.05) lost.push(`${describe(el)}: black shadow on a dark ground`);
      }
      return {
        distinct: values.size,
        values: [...values].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, n]) => `${k} ×${n}`),
        mixed: signs.x.size > 1 || signs.y.size > 1,
        lost,
      };
    };

    const glass = () => {
      const els = all().filter((el) => { const b = cs(el).backdropFilter; return b && b !== 'none' && shown(el); });
      const nested = els.flatMap((el) => { const host = els.find((o) => o !== el && o.contains(el)); return host ? [`${describe(el)} in ${describe(host)}`] : []; });
      const blur = new Map();
      for (const el of els) { const m = cs(el).backdropFilter.match(/blur\(([^)]*)\)/); if (m) blur.set(m[1], (blur.get(m[1]) || 0) + 1); }
      let reducedTransparency = false;
      const walk = (rules) => {
        for (const rule of rules) {
          if ((rule.conditionText || rule.media?.mediaText || '').includes('prefers-reduced-transparency')) reducedTransparency = true;
          if (rule.cssRules) walk(rule.cssRules);
        }
      };
      for (const sheet of document.styleSheets) { try { walk(sheet.cssRules); } catch { /* another origin */ } }
      return { n: els.length, nested: nested.slice(0, 10), blur: [...blur].map(([v, n]) => `${v}×${n}`), reducedTransparency };
    };

    const gradients = () => {
      let n = 0;
      let large = 0;
      for (const el of all()) {
        if (!cs(el).backgroundImage.includes('gradient') || !shown(el)) continue;
        n++;
        const r = el.getBoundingClientRect();
        if (r.width * r.height >= 0.25 * innerWidth * innerHeight) large++;
      }
      return { n, large };
    };

    const textures = () => {
      const out = new Set();
      for (const svg of document.querySelectorAll('svg')) if (svg.querySelector('feTurbulence')) out.add(`${name(svg)}: feTurbulence`);
      for (const el of all()) {
        for (const pseudo of [undefined, '::before', '::after']) {
          const s = cs(el, pseudo);
          if (pseudo && s.content === 'none') continue;
          const where = pseudo ? name(el) + pseudo : name(el);
          if (/noise|grain|texture|turbulence/i.test(s.backgroundImage)) out.add(`${where}: background ${s.backgroundImage.includes('Turbulence') ? 'feTurbulence' : 'named noise or grain'}`);
          if (s.mixBlendMode !== 'normal' && (pseudo || !el.textContent.trim())) {
            const w = pseudo ? parseFloat(s.width) : el.getBoundingClientRect().width;
            const h = pseudo ? parseFloat(s.height) : el.getBoundingClientRect().height;
            if (w * h >= 0.5 * innerWidth * innerHeight) out.add(`${where}: ${s.mixBlendMode} layer over ${Math.min(100, Math.round(((w * h) / (innerWidth * innerHeight)) * 100))} % of the screen`);
          }
        }
        if (out.size >= 10) break;
      }
      return [...out];
    };

    window.__imagery = { visuals, firstScreen, images, candidates, textBox, framed, hideText, shapes, shadows, glass, gradients, textures };
  });

  // Decodes a PNG in the page (no data: URL, so the site's CSP cannot block it) and returns the contrast
  // of the text colour against the worst 5 % of its pixels, and whether the ground is one flat colour.
  const worst = (png, color) => page.evaluate(async ({ b64, color }) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const bmp = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
    const canvas = new OffscreenCanvas(bmp.width, bmp.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bmp, 0, 0);
    const d = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
    const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const lt = lum(...color);
    const step = Math.max(1, Math.floor(d.length / 4 / 40000));
    const lums = [];
    for (let p = 0; p < d.length; p += 4 * step) lums.push(lum(d[p], d[p + 1], d[p + 2]));
    lums.sort((a, b) => a - b);
    const [low, high] = [lums[Math.floor(lums.length * 0.05)], lums[Math.floor(lums.length * 0.95)]];
    const ratios = lums.map((l) => (Math.max(l, lt) + 0.05) / (Math.min(l, lt) + 0.05)).sort((a, b) => a - b);
    return { ratio: ratios[Math.floor(ratios.length * 0.05)], flat: (high + 0.05) / (low + 0.05) < 1.1 };
  }, { b64: png.toString('base64'), color });

  const report = { url, pass: true, visuals: {}, shapes: [], shadows: null, glass: null, gradients: null, textures: [], images: null, contrast: [], unmeasured: [], issues: [] };
  const lists = { unsized: new Map(), blurry: new Map(), soft: new Map(), heavy: new Map(), lazyFirst: new Map() }; // item → its widths
  const unmeasured = new Set();
  const failing = new Map();
  const measured = [];
  let images = { n: 0, outlined: 0 };
  try {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const [width, height] of SIZES) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => scrollTo(0, 0));
      await frame();
      const found = await page.evaluate(([w, max]) => {
        const I = window.__imagery;
        const vis = I.visuals();
        const out = { first: I.firstScreen(vis), images: I.images(), texts: I.candidates(vis, max) };
        if (w === 1440) Object.assign(out, { shapes: I.shapes(), shadows: I.shadows(), glass: I.glass(), gradients: I.gradients(), textures: I.textures() });
        return out;
      }, [width, MAX_TEXT]);
      report.visuals[width] = found.first;
      for (const kind of Object.keys(lists)) for (const item of found.images[kind]) lists[kind].set(item, [...(lists[kind].get(item) || []), width]);
      if (width === 1440) {
        images = { n: found.images.n, outlined: found.images.outlined };
        Object.assign(report, { shapes: found.shapes, shadows: found.shadows, glass: found.glass, gradients: found.gradients, textures: found.textures });
      }
      await page.evaluate(() => window.__imagery.hideText(true));
      try {
        for (let i = 0; i < found.texts.length; i++) {
          const { at, large, blend, color, solid } = found.texts[i];
          if (blend) { unmeasured.add(`${at}: blend mode ${blend}`); continue; }
          const box = await page.evaluate((n) => window.__imagery.textBox(n), i);
          if (!box) continue;
          if (box.covered) { unmeasured.add(`${at}: covered by ${box.covered}`); continue; }
          if (box.video) await page.waitForFunction((n) => window.__imagery.framed(n), i, { timeout: 2000 }).catch(() => {});
          if (!(await page.evaluate((n) => window.__imagery.framed(n), i))) { unmeasured.add(`${at}: the video under it shows no frame yet`); continue; }
          await frame();
          const { ratio, flat } = await worst(await page.screenshot({ clip: { x: box.x, y: box.y, width: box.width, height: box.height } }), color);
          if (flat && solid) continue; // text on its own flat ground is axe's to judge
          const needs = large ? 3 : 4.5;
          measured.push({ at, width, ratio: Math.round(ratio * 100) / 100, needs });
          if (ratio < needs) {
            if (!failing.has(at)) failing.set(at, { ratio, needs, widths: new Set() });
            const f = failing.get(at);
            f.ratio = Math.min(f.ratio, ratio);
            f.widths.add(width);
          }
        }
      } finally {
        await page.evaluate(() => window.__imagery.hideText(false));
      }
    }
  } finally {
    await page.emulateMedia({ reducedMotion: null });
    if (start) await page.setViewportSize(start);
    await page.evaluate(() => scrollTo(0, 0));
  }
  report.images = { ...images, ...Object.fromEntries(Object.entries(lists).map(([k, v]) => [k, [...v].slice(0, MAX).map(([item, w]) => `${item} (${w.join(', ')} px)`)])) };
  report.contrast = measured.sort((a, b) => a.ratio - b.ratio).slice(0, 20);
  report.unmeasured = [...unmeasured].slice(0, MAX);
  report.issues = [...failing.entries()].slice(0, MAX).map(([at, f]) => ({
    kind: 'text-over-image', at, rule: 'WCAG 1.4.3',
    detail: `${Math.round(f.ratio * 100) / 100}:1 on its worst 5 %, needs ${f.needs}:1, at ${[...f.widths].join(', ')} px`,
  }));
  report.pass = report.issues.length === 0;
  return report;
}
