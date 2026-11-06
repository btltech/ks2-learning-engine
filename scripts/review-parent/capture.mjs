// Run against the synthetic review server only. Playwright is a temporary review
// tool, not an application dependency. See the review README for invocation.
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const stage = process.argv[2] || 'after';
const out = resolve('design/redesign-2026/review/parent');
await mkdir(out, { recursive: true });
const cases = [
  ['home', 'screen=home'], ['dashboard', 'screen=dashboard'], ['monitoring', 'screen=monitoring'],
  ...['progress', 'insights', 'leaderboard', 'reports', 'settings'].map(tab => [tab, 'screen=monitoring&tab=' + tab]),
  ['struggle', 'screen=struggle'], ['create', 'screen=monitoring&empty'],
];
const browser = await chromium.launch({ headless: true, ...(process.env.REVIEW_BROWSER ? { executablePath: process.env.REVIEW_BROWSER } : {}) });
const context = await browser.newContext();
await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const audits = [];
for (const width of process.env.REVIEW_WIDTHS ? process.env.REVIEW_WIDTHS.split(',').map(Number) : stage === 'after' ? [390, 768, 1280] : [390, 1280]) {
  await page.setViewportSize({ width, height: 900 });
  for (const theme of process.env.REVIEW_THEMES?.split(',') || ['standard', 'dark', 'contrast']) {
    for (const [name, query] of cases.filter(([name]) => !process.env.REVIEW_CASES || process.env.REVIEW_CASES.split(',').includes(name))) {
      await page.goto((process.env.REVIEW_URL || 'http://127.0.0.1:3011') + '/scripts/review-parent/index.html?' + query + '&theme=' + theme, { waitUntil: 'networkidle' });
      await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
      if (width !== 768 && !process.env.REVIEW_NO_SHOTS) await page.screenshot({ path: resolve(out, `${stage}-${name}-${theme}-${width}.jpg`), type: 'jpeg', quality: 60, fullPage: true, animations: 'disabled' });
      if (stage === 'after') {
        await page.addScriptTag({ path: process.env.REVIEW_AXE || resolve('node_modules/axe-core/axe.min.js') });
        const audit = await page.evaluate(async () => {
          const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] } });
          const visible = e => !!e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden';
          return { violations: result.violations, incomplete: result.incomplete.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })), width: innerWidth, documentWidth: document.documentElement.scrollWidth,
            overflow: [...document.querySelectorAll('main *')].filter(e => visible(e) && e.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(e).position !== 'fixed').slice(0, 10).map(e => ({ tag: e.tagName, class: e.className })),
            smallTargets: [...document.querySelectorAll('button,a,input,select,textarea')].filter(e => visible(e) && !e.disabled && (e.getBoundingClientRect().width < 48 || e.getBoundingClientRect().height < 48)).map(e => ({ label: e.getAttribute('aria-label') || e.textContent.slice(0, 80), width: e.getBoundingClientRect().width, height: e.getBoundingClientRect().height })),
          };
        });
        audits.push({ name, theme, viewport: width, ...audit });
        console.log(`${name} ${theme} ${width}: ${audit.violations.length} violations; ${audit.smallTargets.length} small targets; width ${audit.documentWidth}`);
      }
    }
    console.log(`${stage}: ${width}px ${theme} complete`);
  }
}
await writeFile(resolve(out, stage + '-audits.json'), JSON.stringify({ errors, audits }, null, 2) + '\n');
await browser.close();
if (errors.length) { console.error(errors); process.exitCode = 1; }
