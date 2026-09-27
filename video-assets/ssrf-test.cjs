const { chromium } = require('playwright');
const URL = 'https://app-sigma-nine-87.vercel.app/';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });

  await page.fill('#domain', 'localhost');
  const consentBox = page.locator('input[type=checkbox]');
  if (!(await consentBox.isChecked())) await consentBox.click();
  await page.click('button[type=submit]');
  await page.waitForTimeout(6000);

  const bodyText = await page.innerText('body');
  console.log('--- FULL BODY TEXT AFTER localhost SUBMIT ---');
  console.log(bodyText.slice(0, 1500));

  await browser.close();
}
main().catch(e => { console.error(e); process.exit(1); });
