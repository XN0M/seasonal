// Reproducible adaptation of licensed, self-contained vector source archives.
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {inflateRawSync,gzipSync} from 'node:zlib'
const sourceDirectory='docs/assets/source'
function unzipJson(bytes){
  const results=[]
  for(let index=0;index<bytes.length-46;index++){
    if(bytes.readUInt32LE(index)!==0x02014b50)continue
    const method=bytes.readUInt16LE(index+10),size=bytes.readUInt32LE(index+20)
    const nameLength=bytes.readUInt16LE(index+28),extra=bytes.readUInt16LE(index+30),comment=bytes.readUInt16LE(index+32)
    const name=bytes.subarray(index+46,index+46+nameLength).toString()
    const offset=bytes.readUInt32LE(index+42)
    if(name.startsWith('animations/')&&name.endsWith('.json')){
      const start=offset+30+bytes.readUInt16LE(offset+26)+bytes.readUInt16LE(offset+28)
      const raw=bytes.subarray(start,start+size)
      results.push(JSON.parse((method===8?inflateRawSync(raw):raw).toString()))
    }
    index+=45+nameLength+extra+comment
  }
  if(results.length!==1)throw Error('Expected exactly one vector animation')
  return results[0]
}
function inspect(value){
  if(!value||typeof value!=='object')return
  if(typeof value.x==='string'||value.ty===5||typeof value.p==='string')throw Error('Unsupported expression, text or image')
  Object.values(value).forEach(inspect)
}
const rgb=hex=>hex.slice(1).match(/../g).map(channel=>parseInt(channel,16)/255)
function adaptColours(value,motif){
  if(!value||typeof value!=='object')return
  if(['fl','st'].includes(value.ty)&&value.c?.a===0&&Array.isArray(value.c.k)){
    const [r,g,b]=value.c.k,light=Math.max(r,g,b),dark=Math.min(r,g,b)
    // Preserve the source's tonal hierarchy. Flattening every orange to one
    // colour erased the ribs, cut-out face and leaves into a solid silhouette.
    const colour=motif==='pumpkin'
      ? (g>r?'#a59668':value.ty==='st'?'#985336':r<.6?'#432b3b':r<.85?'#a85e3c':g<.4?'#bd7547':'#db9a60')
      :light-dark<.12?(light>.7?'#fffdf9':'#56344f'):motif==='ghost'?'#c6a46a':r>g?'#c47c45':'#c6a46a'
    value.c.k=[...rgb(colour),...(value.c.k.length>3?[1]:[])]
  }
  Object.values(value).forEach(child=>adaptColours(child,motif))
}
function freezeNumericTransforms(value,frame){
  if(!value||typeof value!=='object')return
  if(value.a===1&&Array.isArray(value.k)&&value.k.every(key=>Array.isArray(key.s)&&key.s.every(channel=>typeof channel==='number'))){
    const sample=value.k.filter(key=>key.t<=frame).at(-1)||value.k[0]
    value.a=0;value.k=sample.s.length===1?sample.s[0]:sample.s
  }
  Object.values(value).forEach(child=>freezeNumericTransforms(child,frame))
}
function gentlePumpkin(data){
  // Keep the licensed vector forms, replace wide entrance/sideways choreography
  // with a seamless ten-second vertical float. No independent CSS motion.
  freezeNumericTransforms(data,(data.ip+data.op)*.55)
  data.h=1300
  const positions=[[1114.5,1250,0],[1840,1145,0],[360,1145,0]]
  data.layers.forEach((layer,index)=>{
    const base=positions[index]
    const high=base.map((value,axis)=>axis===1?value-45:value)
    layer.ks.r={a:0,k:0}
    layer.ks.p={a:1,k:[
      {t:0,s:base,e:high,i:{x:.667,y:1},o:{x:.333,y:0},to:[0,0,0],ti:[0,0,0]},
      {t:120,s:high,e:base,i:{x:.667,y:1},o:{x:.333,y:0},to:[0,0,0],ti:[0,0,0]},
      {t:240,s:base},
    ]}
  })
  const timeline=value=>{if(!value||typeof value!=='object')return;if(Array.isArray(value.layers))value.layers.forEach(layer=>{layer.ip=0;layer.op=240;layer.st=0});Object.values(value).forEach(timeline)}
  timeline(data);data.ip=0;data.op=240
}
function friendlyPumpkinFace(data){
  // Original curved face adaptation: keep the licensed body/ribs/foliage,
  // replace the toothy source expression with smaller round eyes and a smile.
  const eye={i:[[-25,0],[0,-25],[25,0],[0,25]],o:[[25,0],[0,25],[-25,0],[0,-25]],v:[[-160,-100],[-115,-55],[-160,-10],[-205,-55]],c:true}
  const smile={i:[[0,0],[-105,140],[125,160]],o:[[105,140],[0,0],[-125,160]],v:[[-175,100],[325,100],[75,235]],c:true}
  function replace(value,shape){
    if(!value||typeof value!=='object')return
    if(value.ty==='sh')value.ks={a:0,k:structuredClone(shape)}
    Object.values(value).forEach(child=>replace(child,shape))
  }
  for(const asset of data.assets)for(const layer of asset.layers||[]){
    if(asset.id==='comp_3'&&['Shape Layer 5','Shape Layer 6'].includes(layer.nm))replace(layer.shapes,eye)
    if(asset.id==='comp_4')replace(layer.shapes,smile)
  }
}
await mkdir('public/animations/halloween',{recursive:true})
for(const motif of ['pumpkin','ghost','star']){
  const source=motif==='star'?JSON.parse(await readFile(`${sourceDirectory}/star.json`,'utf8')):unzipJson(await readFile(`${sourceDirectory}/${motif}.lottie`))
  inspect(source)
  if(source.fonts)throw Error('Fonts are not allowed')
  const data=structuredClone(source)
  if(motif==='ghost'){
    data.layers=data.layers.filter(layer=>layer.nm==='Ghost Animation')
    data.w=1000;data.h=1200;data.layers[0].ks.p.k=[500,650,0]
    // Remove all grave/lettering shapes; retain the licensed floating character only.
  }
  if(motif==='pumpkin'){gentlePumpkin(data);friendlyPumpkinFace(data)}
  adaptColours(data,motif)
  data.fr=(data.op-data.ip)/10
  const json=JSON.stringify(data),bytes=gzipSync(json).length
  if(bytes>150*1024)throw Error('Asset budget exceeded')
  await writeFile(`public/animations/halloween/${motif}.json`,json)
  console.log(motif,bytes,'gzip bytes',data.w,data.h,'layers',data.layers.length)
}
