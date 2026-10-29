// views.js · the page currently open, seen three ways at 1440 and 390 px, for the diagnosis tests.
// Usage: open the page with browser_navigate, then call browser_run_code_unsafe
// with { "filename": "design/reviews/scripts/views.js" }. The studio copies this
// file into each project at kickoff and fills in the output folder.
//
// For each width it writes three full-page screenshots: as the page is ("normal"), without its hues
// ("grey", a CSS grayscale filter: do the ranks hold by lightness alone, do touching colours merge?),
// and without its detail ("blur", a CSS blur filter: where do the masses pull the eye?). These are
// observations for the art director and the critic (skills/art-direction/references/diagnosis.md),
// never a verdict. The page is left as it was, without a filter.
async (page) => {
  const OUT = '__OUT__';
  const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
  const VIEWS = { normal: 'none', grey: 'grayscale(1)', blur: 'blur(8px)' };
  const url = page.url();
  const slug = (new URL(url).pathname.replace(/^\/+|\.html?$/g, '').replace(/[^a-z0-9]+/gi, '-') || 'index').toLowerCase();
  const files = [];
  // Reveals are shown in their final state, so that every view holds the whole content.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [viewport, size] of Object.entries(VIEWPORTS)) {
    await page.setViewportSize(size);
    await page.goto(url);
    await page.waitForLoadState('load');
    await page.evaluate(() => document.fonts && document.fonts.ready.then(() => true));
    await page.waitForTimeout(800);
    for (const [view, filter] of Object.entries(VIEWS)) {
      await page.evaluate((f) => { document.documentElement.style.filter = f === 'none' ? '' : f; }, filter);
      const file = `${OUT}/${slug}-${viewport}-${view}.png`;
      await page.screenshot({ path: file, fullPage: true });
      files.push(file);
    }
    await page.evaluate(() => { document.documentElement.style.filter = ''; });
  }
  await page.emulateMedia({ reducedMotion: null });
  await page.setViewportSize(VIEWPORTS.desktop);
  await page.goto(url);
  await page.waitForLoadState('load');
  return { url, files };
}
