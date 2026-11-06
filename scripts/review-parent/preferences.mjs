import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.REVIEW_BROWSER ? { executablePath: process.env.REVIEW_BROWSER } : {}) });
const context = await browser.newContext();
const external = [];
await context.route('**/*', route => {
  if (new URL(route.request().url()).hostname === '127.0.0.1') return route.continue();
  external.push(route.request().url()); return route.abort();
});
const page = await context.newPage(), samples = [];
for (const width of [390,768,1280]) for (const preference of ['ui','os']) {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: preference === 'os' ? 'reduce' : 'no-preference' });
  await page.goto('http://127.0.0.1:3011/scripts/review-parent/index.html?screen=dashboard' + (preference === 'ui' ? '&motion' : ''), { waitUntil: 'networkidle' });
  const sample = await page.evaluate(async () => {
    await document.fonts.ready;
    const h = getComputedStyle(document.querySelector('#parent-dashboard-title').closest('h2'));
    const p = getComputedStyle(document.querySelector('.cp-header p'));
    return { headingFont: h.fontFamily, headingWeight: h.fontWeight, bodyFont: p.fontFamily, localFontsReady: document.fonts.check('600 20px Lexend') && document.fonts.check('700 20px Lexend'),
      logoStaticTransform: getComputedStyle(document.querySelector('.sunny-logo svg g[transform]')).transform,
      animations: [...document.querySelectorAll('.clear-path-parent *')].filter(e => getComputedStyle(e).animationName !== 'none').map(e => ({ tag: e.tagName, animation: getComputedStyle(e).animationName })), transition: getComputedStyle(document.querySelector('.cp-header button')).transitionDuration };
  });
  assert.match(sample.headingFont, /Lexend/); assert.match(sample.bodyFont, /Atkinson/); assert(sample.localFontsReady);
  assert.notEqual(sample.logoStaticTransform, 'none'); assert.equal(sample.animations.length, 0); assert.equal(sample.transition, '0s');
  samples.push({ width, preference, ...sample });
}
assert.equal(external.length, 0);
await writeFile('design/redesign-2026/review/parent/preferences.json', JSON.stringify({ samples, externalRequests: external }, null, 2) + '\n');
await browser.close();console.log('6 display preference/font/static-logo checks passed; no external requests');
