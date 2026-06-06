// scripts/lighthouse.js
/**
 * Simple Lighthouse runner for accessibility audit.
 * Run with: node scripts/lighthouse.js
 * It launches Chrome, runs Lighthouse against the dev server (http://localhost:3000),
 * then prints a concise accessibility score and logs any violations.
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

(async () => {
  const url = process.env.LIGHTHOUSE_URL || 'http://localhost:3000';
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['accessibility'],
    port: chrome.port,
  };

  try {
    const runnerResult = await lighthouse(url, options);
    const report = runnerResult.lhr;
    const score = report.categories.accessibility.score * 100;
    console.log(`\n📊 Accessibility score for ${url}: ${score}`);
    // Print any failing audits
    const audits = Object.entries(report.audits).filter(([, a]) => a.score !== 1);
    if (audits.length) {
      console.log('\n🛠️ Issues:');
      audits.forEach(([id, audit]) => {
        console.log(`- ${audit.title}: ${audit.description}`);
      });
    } else {
      console.log('✅ No accessibility issues detected!');
    }
  } catch (err) {
    console.error('Lighthouse failed:', err);
  } finally {
    await chrome.kill();
  }
})();
