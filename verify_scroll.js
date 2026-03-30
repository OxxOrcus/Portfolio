const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log("Navigating to local server...");
    await page.goto('http://localhost:3000');

    // Wait for initial animations to finish
    await page.waitForTimeout(6000);

    console.log("Scrolling down 1000px...");
    await page.evaluate(() => window.scrollBy(0, 1000));

    // Wait for scroll animations to trigger
    await page.waitForTimeout(1000);

    console.log("Capturing screenshot...");
    await page.screenshot({ path: 'scroll-verify.png', fullPage: true });

    // Check if the scroll handler executed and updated the header
    const headerBg = await page.evaluate(() => {
        const header = document.getElementById('site-header');
        return header ? header.style.background : null;
    });
    console.log("Header background after scroll:", headerBg);

    // Check if back to top button is visible
    const backToTopVisible = await page.evaluate(() => {
        const btn = document.getElementById('back-to-top');
        return btn ? btn.style.opacity === "1" : false;
    });
    console.log("Back to top visible:", backToTopVisible);

    if (headerBg && headerBg.includes("0.95") && backToTopVisible) {
        console.log("Scroll handler optimizations are functioning correctly.");
    } else {
        console.error("Warning: Scroll handler optimizations may not have applied correctly.");
    }
  } catch (error) {
    console.error("Error during verification:", error);
  } finally {
    await browser.close();
  }
})();
