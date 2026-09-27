const { chromium } = require('playwright');
const URL = 'https://app-sigma-nine-87.vercel.app/';

async function scan(domain) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#domain', domain);
  const consentBox = page.locator('input[type=checkbox]');
  if (!(await consentBox.isChecked())) await consentBox.click();
  await page.click('button[type=submit]');
  await page.waitForTimeout(9000);
  const bodyText = await page.innerText('body');
  const scoreMatch = bodyText.match(/(\d{1,3})\nدرجة الخطر/);
  console.log(`=== ${domain} === score:`, scoreMatch ? scoreMatch[1] : 'N/A');
  await browser.close();
}

async function main() {
  await scan('demo.testfire.net');
  await scan('stackoverflow.com');
  await scan('bugcrowd.com');
}
main().catch(e => { console.error(e); process.exit(1); });
