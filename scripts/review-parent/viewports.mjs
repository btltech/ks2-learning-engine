import { resolve } from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.REVIEW_BROWSER ? { executablePath: process.env.REVIEW_BROWSER } : {}) });
const context = await browser.newContext();
await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
const page = await context.newPage();
for (const stage of ['before','after']) for (const width of [390,1280]) for (const theme of ['standard','dark','contrast']) for (const name of ['home','monitoring']) {
  await page.setViewportSize({ width, height: 900 });
  const base = stage === 'before' ? 'http://127.0.0.1:3012' : 'http://127.0.0.1:3011';
  await page.goto(base + '/scripts/review-parent/index.html?screen=' + name + '&theme=' + theme, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.screenshot({ path: resolve(`design/redesign-2026/review/parent/${stage}-${name}-viewport-${theme}-${width}.jpg`), type: 'jpeg', quality: 65, animations: 'disabled' });
}
await browser.close();
console.log('24 before/after viewport screenshots captured');
