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
  try {
    await page.waitForSelector('text=/[0-9]{1,3}\\s*\\/\\s*100/', { timeout: 30000 });
  } catch (e) {
    // fallback wait
    await page.waitForTimeout(8000);
  }
  await page.waitForTimeout(1500);
  const bodyText = await page.innerText('body');
  const scoreMatch = bodyText.match(/(\d{1,3})\s*\/\s*100/);
  console.log(`=== ${domain} ===`);
  console.log('score match:', scoreMatch ? scoreMatch[1] : 'NOT FOUND');
  console.log(bodyText.slice(0, 900));
  console.log('');
  await browser.close();
}

async function main() {
  // github.com: well-known public bug bounty program (HackerOne), generally hardened
  await scan('github.com');
  // hackerone.com itself, also runs its own bug bounty
  await scan('hackerone.com');
}
main().catch(e => { console.error(e); process.exit(1); });
