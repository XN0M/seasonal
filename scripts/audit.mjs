import lighthouse from 'lighthouse'
import {launch} from 'chrome-launcher'
import {chromium} from 'playwright'
import {mkdir,writeFile} from 'node:fs/promises'

const args = process.argv.slice(2)
const url = args.find(arg => !arg.startsWith('--')) || 'http://127.0.0.1:5180/en-gb/'
const count = Number(args.find(arg => arg.startsWith('--runs='))?.split('=')[1] || 1)
const label = args.find(arg => arg.startsWith('--label='))?.split('=')[1]
const effects = args.find(arg => arg.startsWith('--effects='))?.split('=')[1]
if (effects && !['on','off'].includes(effects)) throw new Error('--effects must be on or off')
if (label && !/^[a-z0-9-]+$/.test(label)) throw new Error('--label must contain lowercase letters, digits or hyphens')
const output = `docs/qa/lighthouse-${label ? `${label}-` : ''}mobile`
if (!Number.isInteger(count) || count < 1 || count > 10) throw new Error('--runs must be an integer from 1 to 10')
const runs = []
await mkdir('docs/qa', { recursive: true })
for (let run = 1; run <= count; run++) {
  const chrome = await launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'] })
  let connection
  try {
    if(effects){
      // Use an isolated Chrome profile and preserve only the functional display preference.
      connection=await chromium.connectOverCDP(`http://127.0.0.1:${chrome.port}`)
      const context=connection.contexts()[0]
      const page=context.pages()[0]||await context.newPage()
      await page.goto(url)
      await page.evaluate(value=>localStorage.setItem('seasonal-edit-effects-v2',value),effects)
      await page.goto('about:blank')
      const session=await context.newCDPSession(page)
      await session.send('Network.clearBrowserCache') // No warm-cache advantage from preference setup.
      await session.detach()
    }
    const result = await lighthouse(url, { port: chrome.port, logLevel: 'error', ...(effects?{disableStorageReset:true}:{}), onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] })
    if (!result) throw new Error('Lighthouse returned no result')
    await writeFile(`${output}.json`, JSON.stringify(result.lhr, null, 2))
    if (count > 1) await writeFile(`${output}-run-${run}.json`, JSON.stringify(result.lhr, null, 2))
    const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([key, value]) => [key, Math.round(value.score * 100)]))
    const measured = {
      run, timestamp: result.lhr.fetchTime, scores,
      LCPms: result.lhr.audits['largest-contentful-paint'].numericValue,
      CLS: result.lhr.audits['cumulative-layout-shift'].numericValue,
      TBTms: result.lhr.audits['total-blocking-time'].numericValue,
      effects:effects||'device-default',
      animationDataLoaded:result.lhr.audits['network-requests'].details.items.some(item=>item.url.includes('/animations/')&&item.url.endsWith('.json')),
    }
    if(effects==='on'&&!measured.animationDataLoaded)throw new Error('Effects-on audit did not capture Lottie data; do not report it as active-motion performance')
    runs.push(measured)
    console.log(JSON.stringify(measured, null, 2))
  } finally { await connection?.close();chrome.kill() }
}
const median = values => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}
const summary = {
  url, runs, medianLCPms: median(runs.map(run => run.LCPms)),
  acceptance: {
    performance: runs.every(run => run.scores.performance >= 90),
    accessibility: runs.every(run => run.scores.accessibility >= 95),
    medianLCP: median(runs.map(run => run.LCPms)) <= 2500,
    CLS: runs.every(run => run.CLS <= .1),
  },
  note: 'Local mobile lab results; noindex intentionally limits SEO. TBT is not field INP.',
}
await writeFile(`${output}-summary.json`, JSON.stringify(summary, null, 2))
console.log(JSON.stringify({ medianLCPms: summary.medianLCPms, acceptance: summary.acceptance }, null, 2))
