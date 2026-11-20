// capture.js · desktop and mobile contact sheets of the page currently open, for the critic.
// Usage: open the page with browser_navigate, then call browser_run_code_unsafe
// with { "filename": "design/reviews/scripts/capture.js" }. The studio copies this
// file into each project at kickoff and fills in the output folder.
//
// It scrolls with the mouse wheel, the window or the container the page scrolls in, and spaces
// the frames so that the whole page fits in MAX_FRAMES. Each sheet's header says how far apart the
// frames are and whether the end of the page was reached; the return value says the same.
async (page) => {
  const OUT = '__OUT__';
  const VIEWPORTS = {
    desktop: { width: 1440, height: 900, columns: 3 },
    mobile: { width: 390, height: 844, columns: 6 },
  };
  const MAX_FRAMES = 16;
  const url = page.url();
  const slug = (new URL(url).pathname.replace(/^\/+|\.html?$/g, '').replace(/[^a-z0-9]+/gi, '-') || 'index').toLowerCase();
  const escape = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const files = [];
  const sheets = [];

  // The page scrolls in the window, or in its largest scrolling element when the window cannot scroll.
  const measure = () => page.evaluate(() => {
    const root = document.scrollingElement;
    const rootScrolls = root.scrollHeight > root.clientHeight + 1
      && ![document.documentElement, document.body].some((el) => /hidden|clip/.test(getComputedStyle(el).overflowY));
    let scroller = rootScrolls ? root : null;
    if (!scroller) {
      let area = 0;
      for (const el of document.body.querySelectorAll('*')) {
        if (el.scrollHeight <= el.clientHeight + 1 || !/auto|scroll/.test(getComputedStyle(el).overflowY)) continue;
        if (el.clientWidth * el.clientHeight > area) { area = el.clientWidth * el.clientHeight; scroller = el; }
      }
    }
    if (!scroller) return { y: 0, max: 0, container: false };
    return { y: Math.round(scroller.scrollTop), max: scroller.scrollHeight - scroller.clientHeight, container: scroller !== root };
  });

  for (const [name, vp] of Object.entries(VIEWPORTS)) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(url);
    await page.waitForLoadState('load');
    await page.waitForTimeout(1500);

    // Scroll with the wheel, so scroll-driven motion and smooth-scroll libraries react as for a visitor.
    const start = await measure();
    const step = Math.max(Math.round(vp.height * 0.85), Math.ceil(start.max / (MAX_FRAMES - 1)));
    const frames = [];
    let last = start;
    let previous = -1;
    for (let i = 0; i < MAX_FRAMES; i++) {
      const at = await measure();
      if (at.y === previous) break;
      previous = at.y;
      last = at;
      const shot = await page.screenshot({ type: 'jpeg', quality: 70 });
      frames.push({ y: at.y, data: shot.toString('base64') });
      await page.mouse.move(vp.width / 2, vp.height / 2);
      await page.mouse.wheel(0, step);
      await page.waitForTimeout(700);
    }
    const reachedEnd = last.y >= last.max - 1;

    const notes = [`${frames.length} frames, one every ${step}px`];
    if (step > vp.height) notes.push('gaps between frames');
    if (start.container) notes.push('the page scrolls inside a container');
    if (!reachedEnd) notes.push(`stopped at ${last.y} of ${last.max}px: the end of the page is not on this sheet`);

    const sheet = await page.context().newPage();
    await sheet.setViewportSize({ width: 1800, height: 200 });
    await sheet.setContent(`<body style="margin:0;background:#202020;color:#ddd;font:13px ui-monospace,monospace">
      <div style="padding:8px">${escape(url)} · ${name} ${vp.width}×${vp.height} · ${escape(notes.join(' · '))}</div>
      <div style="display:grid;grid-template-columns:repeat(${vp.columns},1fr);gap:6px;padding:6px">
      ${frames.map((f) => `<figure style="margin:0"><img style="width:100%;display:block" src="data:image/jpeg;base64,${f.data}"><figcaption>scroll ${f.y}</figcaption></figure>`).join('')}
      </div></body>`);
    await sheet.waitForFunction(() => [...document.images].every((img) => img.complete));
    const path = `${OUT}/${slug}-${name}.png`;
    await sheet.screenshot({ path, fullPage: true });
    await sheet.close();
    files.push(path);
    sheets.push({ viewport: name, frames: frames.length, step, reachedEnd, container: start.container });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  return { url, files, sheets };
}
