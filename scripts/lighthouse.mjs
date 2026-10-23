import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
const url = process.argv[2] || 'http://127.0.0.1:5192/';
const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome = await launch({
  chromePath: process.env.CHROME_PATH || (existsSync(macChrome) ? macChrome : undefined),
  chromeFlags: ['--headless'],
});
try {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    logLevel: 'error',
  });
  if (!result) throw new Error('Lighthouse did not return a report.');
  mkdirSync('output', { recursive: true });
  writeFileSync('output/lighthouse.html', result.report);
  writeFileSync('output/lighthouse.json', JSON.stringify(result.lhr, null, 2));
  console.log(
    Object.fromEntries(
      Object.entries(result.lhr.categories).map(([key, value]) => [key, value.score]),
    ),
  );
  if (result.lhr.runtimeError) throw new Error(result.lhr.runtimeError.message);
} finally {
  await chrome.kill();
}
