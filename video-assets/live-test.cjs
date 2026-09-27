// Live end-to-end smoke test against the deployed production URL.
const { chromium } = require('playwright');

const URL = 'https://app-sigma-nine-87.vercel.app/';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } }).catch(async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    return ctx.newPage();
  });

  const results = {};

  // 1. Page loads
  const resp = await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  results.homepage_status = resp.status();
  results.title = await page.title();

  // 2. Run the demo scan (Arabic default)
  await page.click('#domain');
  await page.fill('#domain', 'demo.testfire.net');
  await page.click('input[type=checkbox]');
  await page.click('button[type=submit]');
  try {
    await page.waitForSelector('text=درجة الخطر', { timeout: 30000 });
    results.demo_scan_ar = 'OK - report appeared';
  } catch (e) {
    results.demo_scan_ar = 'FAILED - no report after 30s: ' + e.message;
  }
  await page.waitForTimeout(1500);
  const bodyText1 = await page.innerText('body');
  results.provider_marker_ar = bodyText1.includes('gemini') ? 'gemini' : (bodyText1.includes('local') || bodyText1.includes('محفوظة') ? 'LOCAL/FALLBACK' : 'unknown');
  results.finding_count_hint = (bodyText1.match(/رؤوس الأمان/g) || []).length;

  // 3. Switch to French, confirm report re-fetches in French
  const frBtn = page.locator('button', { hasText: 'Français' });
  await frBtn.click();
  try {
    await page.waitForSelector('text=Score de risque', { timeout: 30000 });
    results.language_switch_fr = 'OK - report switched to French';
  } catch (e) {
    results.language_switch_fr = 'FAILED: ' + e.message;
  }

  // 4. Test SSRF guard with a private-IP-like domain
  await page.click('input[type=checkbox]').catch(() => {});
  const domainInput = page.locator('#domain');
  await domainInput.fill('');
  await domainInput.fill('localhost');
  const consentBox = page.locator('input[type=checkbox]');
  const isChecked = await consentBox.isChecked();
  if (!isChecked) await consentBox.click();
  await page.click('button[type=submit]');
  await page.waitForTimeout(4000);
  const bodyText2 = await page.innerText('body');
  results.ssrf_localhost_blocked = (bodyText2.includes('غير مسموح') || bodyText2.includes('privé') || bodyText2.includes('private') || bodyText2.includes('interdit') || bodyText2.includes('error') || bodyText2.includes('Erreur')) ? 'Likely blocked (error text found)' : 'UNCLEAR - check manually';

  // 5. Test a real public domain end to end
  await domainInput.fill('');
  await domainInput.fill('example.com');
  await page.click('button[type=submit]');
  try {
    await page.waitForSelector('text=Score de risque', { timeout: 30000 });
    results.real_domain_scan = 'OK - example.com scanned successfully';
  } catch (e) {
    results.real_domain_scan = 'FAILED: ' + e.message;
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error('SCRIPT ERROR:', err);
  process.exit(1);
});
