// Records a real screen video of the live app doing the exact demo flow
// described in VIDEO.md, timed to roughly match the ~71s narration.
const { chromium } = require('playwright');

const URL = 'https://app-sigma-nine-87.vercel.app/';
const OUT_DIR = 'C:\\Users\\abdel\\Documents\\hackathon-2026\\video-assets\\raw';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  // --- 0:00–0:15  Empty landing page (the "problem" beat) ---
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(9000);

  // --- 0:15–0:55  Type domain, pick Arabic, run check, show result ---
  await page.click('#domain');
  await page.type('#domain', 'demo.testfire.net', { delay: 60 });
  await page.click('input[type=checkbox]');
  await page.waitForTimeout(500);
  await page.click('button[type=submit]');
  // Wait for the report to actually appear (AI call can take a few seconds)
  await page.waitForSelector('text=درجة الخطر', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(4000);

  // Scroll down slowly to show the action plan + findings
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'smooth' }));
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1000);

  // Switch to French — report re-fetches and re-renders in French
  const frBtn = page.locator('button', { hasText: 'Français' });
  await frBtn.click();
  await page.waitForSelector('text=Score de risque', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);

  // --- 0:55–1:20  Click a source link, then go back (the "proof" beat) ---
  await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'smooth' }));
  await page.waitForTimeout(1500);
  const sourceLink = page.locator('a[href^="http"]').first();
  const href = await sourceLink.getAttribute('href').catch(() => null);
  if (href) {
    const newPagePromise = context.waitForEvent('page').catch(() => null);
    await sourceLink.click({ modifiers: ['Control'] }).catch(() => {});
    const newPage = await newPagePromise;
    if (newPage) {
      await newPage.waitForLoadState('domcontentloaded').catch(() => {});
      await newPage.waitForTimeout(2500);
      await newPage.close();
    }
  }
  await page.bringToFront();
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1500);

  // --- 1:20–1:30  Closing beat: sit on the report / risk gauge ---
  await page.waitForTimeout(3000);

  await context.close();
  await browser.close();
  console.log('DONE');
}

main().catch((err) => {
  console.error('SCRIPT ERROR:', err);
  process.exit(1);
});
