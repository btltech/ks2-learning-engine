import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.REVIEW_BROWSER ? { executablePath: process.env.REVIEW_BROWSER } : {}) });
const context = await browser.newContext();
await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
const page = await context.newPage();
const out = resolve('design/redesign-2026/review/parent');
await mkdir(out, { recursive: true });
const base = process.env.REVIEW_URL || 'http://127.0.0.1:3011';
const stage = process.argv[2] || 'after';
const audits = [], keyboard = [], errors = [];
page.on('pageerror', error => errors.push(error.message));
const go = async (query, theme = 'standard') => {
  await page.goto(base + '/scripts/review-parent/index.html?' + query + '&theme=' + theme, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.ready; });
};
const activate = async (name, role = 'button') => { await page.getByRole(role, { name, exact: true }).focus(); await page.keyboard.press('Enter'); };
const audit = async (name, theme, width) => {
  if (width !== 768) await page.screenshot({ path: resolve(out, `${stage}-${name}-${theme}-${width}.jpg`), type: 'jpeg', quality: 60, fullPage: true, animations: 'disabled' });
  if (stage !== 'after') return;
  await page.addScriptTag({ path: process.env.REVIEW_AXE || resolve('node_modules/axe-core/axe.min.js') });
  const result = await page.evaluate(async () => {
    const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','best-practice'] } });
    return { violations: result.violations, incomplete: result.incomplete.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })), width: innerWidth, documentWidth: document.documentElement.scrollWidth };
  });
  audits.push({ name, theme, viewport: width, ...result });
  console.log(`${name} ${theme} ${width}: ${result.violations.length} violations`);
};
for (const width of stage === 'after' ? [390,768,1280] : [390,1280]) {
  await page.setViewportSize({ width, height: 900 });
  for (const theme of ['standard','dark','contrast']) {
    await go('screen=home', theme);
    const preview = page.getByRole('button').filter({ hasText: 'Preview Child View' });
    await preview.focus(); await page.keyboard.press('Enter');
    await page.getByRole('dialog').waitFor();
    await audit('preview', theme, width);
    await page.keyboard.press('Escape');
    if (stage === 'after') assert.equal(await page.getByRole('dialog').count(), 0);

    await go('screen=monitoring&tab=settings', theme);
    await activate('Reset Everything');
    await page.getByRole('alertdialog').waitFor();
    await audit('reset-confirm', theme, width);
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('alertdialog').count(), 0);
    assert.deepEqual(await page.evaluate(() => window.__reviewCalls || []), []);

    await go('screen=dashboard', theme);
    const maths = page.getByRole('button', { name: 'Maths', exact: true });
    await maths.focus(); await page.keyboard.press('Enter');
    const strand = page.getByRole('button').filter({ hasText: /objectives mastered/ }).first();
    await strand.focus(); await page.keyboard.press('Enter');
    await audit('curriculum', theme, width);

    await go('screen=monitoring&tab=reports', theme);
    await activate('📊 Generate Progress Report');
    await page.getByText('Synthetic progress report. Maths: 68% mastery. English: 80% mastery. Practise fractions in short sessions.').waitFor();
    await audit('generated-report', theme, width);

    await go('screen=home', theme); await activate('User menu'); await audit('user-menu', theme, width);
    await go('screen=notifications', theme); await audit('notification', theme, width);
    await go('screen=home&empty', theme); await audit('empty-home', theme, width);
    await go('screen=dashboard&empty', theme); await audit('empty-dashboard', theme, width);
    await go('screen=home', theme); await activate('Dismiss welcome message'); await audit('welcome-dismissed', theme, width);
  }
  if (stage === 'after') {
    await go('screen=monitoring');
    // Reach tabs using only Tab from the initial document focus.
    let reached = false;
    for (let n = 0; n < 60; n++) {
      await page.keyboard.press('Tab');
      if (await page.getByRole('tab', { name: 'Overview', exact: true }).evaluate(el => el === document.activeElement)) { reached = true; break; }
    }
    assert(reached, 'Overview must be reachable with Tab');
    await page.keyboard.press('ArrowRight');
    await page.getByRole('heading', { name: 'Learning Progress', exact: true }).waitFor();
    await page.keyboard.press('End');
    await page.getByRole('heading', { name: 'Settings & Actions', exact: true }).waitFor();
    await activate('Reset Everything');
    assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Cancel');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Yes, Reset All');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Cancel');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Reset Everything');
    let confirmation;
    page.once('dialog', async dialog => { confirmation = { type: dialog.type(), message: dialog.message() }; await dialog.dismiss(); });
    await activate('Delete');
    assert.equal(confirmation?.type, 'confirm');
    assert.match(confirmation.message, /This cannot be undone/);
    assert.deepEqual(await page.evaluate(() => window.__reviewCalls || []), []);

    await go('screen=monitoring');
    const tableRegion = page.getByLabel('Subject progress data', { exact: true });
    await tableRegion.focus(); await page.keyboard.press('ArrowRight');
    if (width === 390) { await page.waitForFunction(() => document.querySelector('.cp-table-frame').scrollLeft > 0); }
    await go('screen=struggle');
    assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Maybe Later');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Notify Parent');
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    keyboard.push({ width, tabs: true, confirmationUnchanged: true, resetFocusTrapAndReturn: true, tableKeyboardScroll: true, struggleFocusAndEscape: true });
    for (const [name, query] of [['monitoring','screen=monitoring'],['home','screen=home'],['dashboard','screen=dashboard'],['create','screen=monitoring&empty']]) {
      await go(query + '&large&motion', 'calm'); await audit(name + '-large-less-movement', 'calm', width);
    }
  }
}
await writeFile(resolve(out, stage + '-interaction-audits.json'), JSON.stringify({ errors, audits, keyboard }, null, 2) + '\n');
await browser.close();
if (errors.length) { console.error(errors); process.exitCode = 1; }
