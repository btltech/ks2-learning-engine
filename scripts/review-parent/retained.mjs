// The repository image budget is twelve after screenshots. Full matrices belong
// in temporary storage; capture.mjs/exercise.mjs reproduce those separately.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out = resolve('design/redesign-2026/review/parent');
const browser = await chromium.launch({ headless: true, ...(process.env.REVIEW_BROWSER ? { executablePath: process.env.REVIEW_BROWSER } : {}) });
try {
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  const page = await context.newPage();
  const cases = [['home','screen=home'], ['monitoring','screen=monitoring'], ['reports','screen=monitoring&tab=reports'], ['settings','screen=monitoring&tab=settings'], ['reset-confirm','screen=monitoring&tab=settings']];
  const shots = cases.flatMap(([name, query]) => [1280,390].map(width => ({ name, query, width, theme: 'standard' })));
  shots.push(...['dark','contrast'].map(theme => ({ name: 'monitoring', query: 'screen=monitoring', width: 390, theme })));
  assert.equal(shots.length, 12);
  for (const { name, query, width, theme } of shots) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:3011/scripts/review-parent/index.html?' + query + '&theme=' + theme, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { await document.fonts.ready; });
    if (name === 'reset-confirm') {
      await page.getByRole('button', { name: 'Reset Everything', exact: true }).focus();
      await page.keyboard.press('Enter');
      await page.getByRole('alertdialog').waitFor();
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    const filename = `after-${name}-${theme}-${width}.jpg`;
    await page.screenshot({ path: resolve(out, filename), type: 'jpeg', quality: 70, fullPage: name !== 'reset-confirm', animations: 'disabled', scale: 'css' });
    console.log(filename);
  }
} finally { await browser.close(); }
