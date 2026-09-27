const { chromium } = require('playwright');
const URL = 'https://app-sigma-nine-87.vercel.app/';

async function score(domain) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#domain', domain);
  const cb = page.locator('input[type=checkbox]');
  if (!(await cb.isChecked())) await cb.click();
  await page.click('button[type=submit]');
  await page.waitForTimeout(9000);
  const text = await page.innerText('body');
  const m = text.match(/(\d{1,3})\nدرجة الخطر/);
  await browser.close();
  return m ? parseInt(m[1], 10) : null;
}

async function main() {
  const domains = ['demo.testfire.net', 'example.com', 'github.com', 'stackoverflow.com', 'gitlab.com', 'dropbox.com', 'shopify.com', 'slack.com', 'hackerone.com', 'bugcrowd.com'];
  const results = {};
  for (const d of domains) {
    results[d] = await score(d);
    console.log(d, '->', results[d]);
  }
  const values = Object.values(results).filter(v => v !== null);
  const at100 = values.filter(v => v === 100).length;
  console.log('\\nTotal scanned:', values.length, '| Scored 100:', at100, '| Distinct values:', new Set(values).size);
}
main().catch(e => { console.error(e); process.exit(1); });
