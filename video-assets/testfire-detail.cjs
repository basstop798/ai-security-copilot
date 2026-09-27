const { chromium } = require('playwright');
async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://app-sigma-nine-87.vercel.app/', { waitUntil: 'networkidle' });
  await page.fill('#domain', 'demo.testfire.net');
  await page.locator('input[type=checkbox]').click();
  await page.click('button[type=submit]');
  await page.waitForTimeout(9000);
  const text = await page.innerText('body');
  console.log(text);
  await browser.close();
}
main();
