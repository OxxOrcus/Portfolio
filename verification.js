const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Intercept requests to Google Fonts and external resources to prevent timeouts
  await page.route('**/*', (route) => {
    if (route.request().resourceType() === 'font' || route.request().url().includes('google')) {
      route.abort();
    } else {
      route.continue();
    }
  });

  try {
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle', timeout: 10000 });

    // Inject custom font to avoid font rendering issues in restricted environments
    await page.addStyleTag({ content: '* { font-family: sans-serif !important; }' });

    // Wait for initial animations to finish (e.g., Matrix rain)
    await page.waitForTimeout(6000);

    // Scroll down to trigger the DOM updates
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'verification.png', fullPage: true });
    console.log('Screenshot saved to verification.png');
  } catch (err) {
    console.error('Playwright verification failed:', err);
  } finally {
    await browser.close();
  }
})();
