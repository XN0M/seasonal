import lighthouse from 'lighthouse'
import {launch} from 'chrome-launcher'
import {chromium} from 'playwright'
import {mkdir,writeFile} from 'node:fs/promises'

const chrome=await launch({chromePath:chromium.executablePath(),chromeFlags:['--headless','--no-sandbox','--disable-dev-shm-usage']})
try{
 const result=await lighthouse(process.argv[2]||'http://127.0.0.1:5180/en-gb/',{port:chrome.port,logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']})
 if(!result)throw new Error('Lighthouse returned no result')
 await mkdir('docs/qa',{recursive:true})
 await writeFile('docs/qa/lighthouse-mobile.json',JSON.stringify(result.lhr,null,2))
 const scores=Object.fromEntries(Object.entries(result.lhr.categories).map(([key,value])=>[key,Math.round(value.score*100)]))
 console.log(JSON.stringify({scores,LCP:result.lhr.audits['largest-contentful-paint'].displayValue,CLS:result.lhr.audits['cumulative-layout-shift'].displayValue,TBT:result.lhr.audits['total-blocking-time'].displayValue},null,2))
}finally{chrome.kill()}
