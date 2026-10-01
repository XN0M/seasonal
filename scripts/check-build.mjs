import {readdir,readFile,stat} from 'node:fs/promises'
import path from 'node:path'

const root=path.resolve('dist')
const errors=[]
const files=[]
async function walk(directory){
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const filename=path.join(directory,entry.name)
    if(entry.isDirectory())await walk(filename)
    else files.push(filename)
  }
}
await walk(root)
const pages=new Map()
for(const file of files.filter(file=>file.endsWith('.html'))){
  const html=await readFile(file,'utf8')
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1])
  if(new Set(ids).size!==ids.length)errors.push(`${path.relative(root,file)}: duplicate element ID`)
  if(!/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html))errors.push(`${path.relative(root,file)}: missing preview noindex`)
  pages.set(file,{html,ids:new Set(ids)})
}
const base=new URL('https://build-check.invalid')
let checked=0
async function checkReference(value,source){
  if(!value||/^(data:|mailto:|tel:)/i.test(value))return
  const route='/'+path.relative(root,source).split(path.sep).join('/').replace(/index\.html$/,'')
  const url=new URL(value.replace(/&amp;/g,'&'),new URL(route,base))
  if(url.origin!==base.origin)return
  if(!url.pathname.startsWith('/'))return
  checked++
  let target=path.resolve(root,'.'+decodeURIComponent(url.pathname))
  if(target!==root&&!target.startsWith(root+path.sep)){errors.push(`${route}: unsafe path ${value}`);return}
  try{if((await stat(target)).isDirectory())target=path.join(target,'index.html');await stat(target)}catch{errors.push(`${route}: missing ${value}`);return}
  if(url.hash&&pages.has(target)&&!pages.get(target).ids.has(decodeURIComponent(url.hash.slice(1))))errors.push(`${route}: missing anchor ${value}`)
}
for(const [file,{html}] of pages){
  for(const match of html.matchAll(/<(?:a|link|img|script|source)\b[^>]*>/g)){
    const tag=match[0]
    for(const attr of tag.matchAll(/\b(?:href|src)="([^"]+)"/g))await checkReference(attr[1],file)
    for(const attr of tag.matchAll(/\bsrcset="([^"]+)"/g))for(const entry of attr[1].split(','))await checkReference(entry.trim().split(/\s+/)[0],file)
  }
  for(const match of html.matchAll(/url\((?:"([^"]*)"|'([^']*)'|([^'"\s)]+))\)/g))await checkReference(match[1]??match[2]??match[3],file)
}
for(const file of files.filter(file=>file.endsWith('.css'))){
  for(const match of (await readFile(file,'utf8')).matchAll(/url\((?:"([^"]*)"|'([^']*)'|([^'"\s)]+))\)/g))await checkReference(match[1]??match[2]??match[3],file)
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
else console.log(`PASS: ${pages.size} HTML pages; ${checked} local link/asset references; no missing anchors, duplicate IDs or indexable preview pages.`)
