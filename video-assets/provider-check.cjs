const { chromium } = require('playwright');
const URL = 'https://app-sigma-nine-87.vercel.app/';

async function attempt(n) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#domain', 'demo.testfire.net');
  const consentBox = page.locator('input[type=checkbox]');
  if (!(await consentBox.isChecked())) await consentBox.click();
  await page.click('button[type=submit]');
  await page.waitForSelector('text=درجة الخطر', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1000);
  const bodyText = await page.innerText('body');
  console.log(`--- Attempt ${n} ---`);
  console.log('has "gemini" word:', bodyText.toLowerCase().includes('gemini'));
  console.log('has "محفوظة" (cached):', bodyText.includes('محفوظة'));
  console.log('has "مصدر":', bodyText.includes('مصدر'));
  const idx = bodyText.indexOf('مصدر');
  if (idx >= 0) console.log('context:', bodyText.slice(idx, idx + 100));
  await browser.close();
}

async function main() {
  for (let i = 1; i <= 3; i++) {
    await attempt(i);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
