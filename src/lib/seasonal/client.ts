import type {AnimationItem} from 'lottie-web'
import {animationLimit,effectsAllowed,resolvePreference,type EffectsPreference} from './themes'
const preferenceKey='seasonal-edit-effects-v2'
const santaKey='seasonal-edit-christmas-santa-seen'
function read(storage:'localStorage'|'sessionStorage',key:string):string|null{try{return window[storage].getItem(key)}catch{return null}}
function write(storage:'localStorage'|'sessionStorage',key:string,value:string):void{try{window[storage].setItem(key,value)}catch{/* In-memory behaviour still works. */}}
interface Decoration{node:HTMLElement;near:boolean;visible:boolean;player?:AnimationItem;loading:boolean;done:boolean;failed:boolean}
export function initialiseSeasonalDecorations():void{
  if(document.documentElement.dataset.decorationsReady==='true')return
  document.documentElement.dataset.decorationsReady='true'
  const nodes=[...document.querySelectorAll<HTMLElement>('[data-decoration]')]
  if(!nodes.length)return
  const root=document.documentElement
  const reduced=matchMedia('(prefers-reduced-motion: reduce)')
  const mobile=matchMedia('(max-width:780px)')
  let preference:EffectsPreference=resolvePreference(read('localStorage',preferenceKey),read('localStorage','seasonal-edit-effects'))
  let loaded=false
  let startupScheduled=false
  let suspended=false
  let santaSeen=read('sessionStorage',santaKey)==='true'
  let santaWanted=false
  const scene=document.querySelector<HTMLElement>('[data-seasonal-scene]')
  const santa=scene?.querySelector<SVGElement>('[data-santa]')
  const decorations:Decoration[]=nodes.map(node=>({node,near:false,visible:false,loading:false,done:false,failed:false}))
  let runtime:Promise<typeof import('lottie-web/build/player/lottie_light')>|undefined
  const dataCache=new Map<string,Promise<Record<string,unknown>>>()
  const load=async(item:Decoration)=>{
    if(item.player||item.loading||item.failed||suspended||item.node.dataset.static==='true'||item.node.dataset.native==='true')return
    item.loading=true
    try{
      const src=item.node.dataset.src!
      if(!dataCache.has(src))dataCache.set(src,fetch(src).then(async response=>{if(!response.ok)throw Error('Decoration unavailable');return await response.json() as Record<string,unknown>}))
      runtime??=import('lottie-web/build/player/lottie_light')
      const [module,data]=await Promise.all([runtime,dataCache.get(src)!])
      const player=module.default.loadAnimation({container:item.node.querySelector<HTMLElement>('[data-decoration-player]')!,renderer:'svg',autoplay:false,loop:item.node.dataset.mode!=='once',animationData:structuredClone(data),rendererSettings:{hideOnTransparent:true}})
      player.addEventListener('DOMLoaded',()=>{
        // Keep the tree recognisable instead of replaying its empty-pot build-in.
        const frames=player.totalFrames
        // Halloween's slow vector timelines need no extra display-rate subframes.
        // Respect their native frame rate instead of recalculating at 60/120Hz.
        if(root.dataset.theme==='halloween')player.setSubframe(false)
        if(item.node.dataset.motif==='tree'){
          player.setSegment(frames*.55,frames*.98)
          player.goToAndStop(0,true)
          player.setSpeed(.43)
        }else player.goToAndStop(frames*.55,true)
        item.player=player;item.loading=false;sync()
      })
      player.addEventListener('complete',()=>{item.done=true;sync()})
      player.addEventListener('data_failed',()=>{item.failed=true;item.loading=false;item.node.dataset.state='error';sync()})
    }catch{item.loading=false;item.failed=true;item.node.dataset.state='error';sync()}
  }
  const setPreference=(value:EffectsPreference)=>{preference=value;write('localStorage',preferenceKey,value);sync()}
  const sync=()=>{
    const allowed=effectsAllowed(preference,reduced.matches)
    root.dataset.effects=allowed?'on':'off'
    root.dataset.effectsPreference=preference
    document.querySelectorAll<HTMLElement>('[data-effects-controls]').forEach(control=>{
      control.hidden=false
      const button=control.querySelector<HTMLButtonElement>('[data-effects-toggle]')!
      button.setAttribute('aria-pressed',String(allowed))
      control.querySelector<HTMLElement>('[data-effects-label]')!.textContent=allowed?button.dataset.on!:button.dataset.off!
      const note=control.querySelector<HTMLElement>('[data-effects-note]')!
      note.hidden=!reduced.matches
      note.textContent=allowed?note.dataset.override!:note.dataset.reduced!
    })
    document.querySelectorAll<HTMLElement>('[data-scene-controls]').forEach(control=>{control.hidden=false})
    const candidates=decorations.filter(item=>item.visible&&!item.done&&!item.failed&&item.node.dataset.static!=='true')
      .sort((a,b)=>Number(b.node.dataset.priority)-Number(a.node.dataset.priority)||Math.abs(a.node.getBoundingClientRect().top-innerHeight/2)-Math.abs(b.node.getBoundingClientRect().top-innerHeight/2))
    const ready=allowed&&loaded&&!document.hidden&&!suspended
    const hero=decorations.find(item=>item.node.dataset.decoration==='hero')
    if(santa&&ready&&hero?.visible&&!santaSeen)santaWanted=true
    const santaRunning=Boolean(santa&&ready&&hero?.visible&&(santaWanted||scene?.dataset.santaState==='playing'))
    if(santaRunning&&santaWanted&&scene){
      santaWanted=false;santaSeen=true;write('sessionStorage',santaKey,'true')
      scene.dataset.santaState='idle';void santa?.getBoundingClientRect();scene.dataset.santaState='playing'
    }
    if(!allowed&&scene){scene.dataset.santaState='done';santaWanted=false}
    const selected=new Set(ready?candidates.slice(0,animationLimit(mobile.matches)-(santaRunning?1:0)):[])
    decorations.forEach(item=>{
      const running=selected.has(item)
      // Do not construct offscreen/over-budget SVG players during the first paint.
      if(ready&&item.near&&selected.has(item))void load(item)
      if(item.node.dataset.native==='true')item.node.dataset.state=running?'running':'static'
      else if(item.player){
        if(running){item.player.play();item.node.dataset.state='running'}else{item.player.pause();item.node.dataset.state=item.failed?'error':'static'}
      }
    })
    if(scene){
      scene.dataset.motion=ready&&hero?.visible?'running':'paused'
      scene.dataset.effects=allowed?'on':'off';scene.dataset.ready='true'
      const replay=scene.querySelector<HTMLButtonElement>('[data-santa-replay]')
      if(replay){replay.hidden=!allowed;replay.disabled=scene.dataset.santaState==='playing'}
      const enable=scene.querySelector<HTMLElement>('[data-effects-enable]');if(enable)enable.hidden=allowed
      const note=scene.querySelector<HTMLElement>('[data-scene-off-note]')
      if(note){note.hidden=allowed&&!reduced.matches;note.textContent=allowed?note.dataset.override!:note.dataset.off!}
    }
    const snow=scene?.querySelector<HTMLElement>('[data-scene-snow]')
    if(snow)snow.dataset.running=String(Boolean(hero&&selected.has(hero)))
    root.dataset.runningDecorations=String([...selected].filter(item=>item.node.dataset.state==='running').length+(santaRunning?1:0))
  }
  const visibility=new IntersectionObserver(entries=>{entries.forEach(entry=>{const item=decorations.find(value=>value.node===entry.target);if(item)item.visible=entry.isIntersecting});sync()})
  const proximity=new IntersectionObserver(entries=>{entries.forEach(entry=>{const item=decorations.find(value=>value.node===entry.target);if(item)item.near=entry.isIntersecting});sync()},{rootMargin:'200px'})
  decorations.forEach(item=>{visibility.observe(item.node);proximity.observe(item.node)})
  document.querySelectorAll<HTMLButtonElement>('[data-effects-toggle]').forEach(button=>button.addEventListener('click',()=>setPreference(effectsAllowed(preference,reduced.matches)?'off':'on')))
  document.querySelector<HTMLButtonElement>('[data-effects-enable]')?.addEventListener('click',()=>setPreference('on'))
  document.querySelector<HTMLButtonElement>('[data-santa-replay]')?.addEventListener('click',()=>{santaWanted=true;sync()})
  santa?.addEventListener('animationend',()=>{if(scene)scene.dataset.santaState='done';sync()})
  const header=decorations.find(item=>item.node.dataset.decoration==='header')
  header?.node.addEventListener('animationend',()=>{header.done=true;sync()},{once:true})
  const afterPrimaryPaint=()=>{
    if(startupScheduled)return
    startupScheduled=true
    // Decorative work yields to the first content paint and idle time, not the shopping UI.
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const unlock=()=>{loaded=true;sync()}
      if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(unlock,{timeout:2000})
      else window.setTimeout(unlock,150)
    }))
  }
  window.addEventListener('load',afterPrimaryPaint,{once:true})
  document.addEventListener('visibilitychange',sync)
  reduced.addEventListener('change',sync);mobile.addEventListener('change',sync)
  window.addEventListener('storage',event=>{if(event.key===preferenceKey||event.key===null){preference=resolvePreference(read('localStorage',preferenceKey),read('localStorage','seasonal-edit-effects'));sync()}})
  window.addEventListener('pagehide',()=>{suspended=true;sync()})
  window.addEventListener('pageshow',()=>{suspended=false;sync()})
  sync()
  if(document.readyState==='complete')afterPrimaryPaint()
}
