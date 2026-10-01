// Original code-native illustration; no generated packaging or external assets.
// Three compositions share one set of illustrated objects, not a stretched image.
import {writeFile} from 'node:fs/promises'
const definitions=`
<radialGradient id="sky" cx="58%" cy="48%" r="72%"><stop stop-color="#574052"/><stop offset=".65" stop-color="#302737"/><stop offset="1" stop-color="#221e2b"/></radialGradient>
<radialGradient id="halo"><stop stop-color="#d7b478" stop-opacity=".17"/><stop offset="1" stop-color="#d7b478" stop-opacity="0"/></radialGradient>
<radialGradient id="lamplight"><stop stop-color="#db9a60" stop-opacity=".2"/><stop offset="1" stop-color="#db9a60" stop-opacity="0"/></radialGradient>
<linearGradient id="moon" x2=".8" y2="1"><stop stop-color="#f2ddb0"/><stop offset="1" stop-color="#c6a46a"/></linearGradient>
<linearGradient id="paper" x2="1" y2=".6"><stop stop-color="#fff0d4"/><stop offset=".5" stop-color="#e7d3ad"/><stop offset="1" stop-color="#c2a882"/></linearGradient>
<linearGradient id="side" x2="1" y2="1"><stop stop-color="#d1b891"/><stop offset="1" stop-color="#ad906b"/></linearGradient>
<linearGradient id="ribbon" x2=".7" y2="1"><stop stop-color="#c68558"/><stop offset=".5" stop-color="#a75e3c"/><stop offset="1" stop-color="#744035"/></linearGradient>
<linearGradient id="plum" x2="1" y2="1"><stop stop-color="#785464"/><stop offset="1" stop-color="#422e40"/></linearGradient>
<radialGradient id="pumpkin" cx="35%" cy="28%" r="85%"><stop stop-color="#eab877"/><stop offset=".5" stop-color="#cf8d53"/><stop offset="1" stop-color="#925137"/></radialGradient>
<linearGradient id="leaf" x2="1" y2="1"><stop stop-color="#c6a46a"/><stop offset="1" stop-color="#806d52"/></linearGradient>
<symbol id="spark" viewBox="-12 -12 24 24"><path d="M0-12 3-3 12 0 3 3 0 12-3 3-12 0-3-3Z" fill="#d9bd88"/></symbol>
<g id="leaf-shape"><path d="M0 0C-6-33 12-55 34-63 40-35 22-12 0 0Z" fill="url(#leaf)"/><path d="M1-2 29-53m-17 32 15-2m-10-9-3-11" stroke="#efd6a5" stroke-width="1" opacity=".45"/></g>
<g id="branch" fill="none"><path d="M0 0Q-60-95-24-210" stroke="#9c8564" stroke-width="2"/>
<use href="#leaf-shape" transform="translate(-18 -31) rotate(-58) scale(.8)"/><use href="#leaf-shape" transform="translate(-27 -59) rotate(37) scale(.68)"/><use href="#leaf-shape" transform="translate(-34 -84) rotate(-70) scale(.74)"/><use href="#leaf-shape" transform="translate(-35 -112) rotate(24) scale(.6)"/><use href="#leaf-shape" transform="translate(-34 -141) rotate(-68) scale(.57)"/><use href="#leaf-shape" transform="translate(-29 -168) rotate(4) scale(.54)"/></g>
<g id="gift">
<path d="m0 40 143-27 64 39-144 34Z" fill="#f6e4c3"/><path d="m0 40 143-27v218L0 251Z" fill="url(#paper)"/><path d="m143 13 64 39v203l-64-24Z" fill="url(#side)"/>
<path d="m0 49 143-27 64 39M8 244l129-21M153 27v197" fill="none" stroke="#fff5df" stroke-width="1.2" opacity=".6"/>
<path d="m57 29 20-4v215l-20 3Z" fill="url(#ribbon)"/><path d="m0 145 143-25 64 26v24l-64-26L0 169Z" fill="url(#ribbon)"/>
<path d="m62 30v211m10-214v212M1 150l142-25 63 26" fill="none" stroke="#dfb58a" stroke-width="1.3" opacity=".55"/>
<path d="M69 27C13 22 1-26 33-27 57-28 62 11 69 27Z" fill="url(#ribbon)" stroke="#daa574" stroke-width="1.4"/><path d="M70 27C70-18 125-39 127-11 129 7 100 19 70 27Z" fill="url(#ribbon)" stroke="#daa574" stroke-width="1.4"/>
<path d="M68 28Q30 41 22 84l24-9 8 20Q49 54 75 33M73 28q48 2 74 42l-23-3-1 19Q108 51 73 33" fill="url(#ribbon)"/>
<path d="M66 20q8-7 17 4l-3 14-15-1Z" fill="#b4754c" stroke="#d49c6b"/>
<path d="M90 72q-5 23-13 44" stroke="#856843" fill="none"/><path d="m69 108 28 6-7 41-34-9 8-28Z" fill="#fff0d4" stroke="#b99a6d"/>
<circle cx="72" cy="119" r="2.5" fill="#9d7b4f"/><path d="m77 131 2 4 5 1-4 3 1 5-4-3-4 2 1-5-3-3 5-1Z" fill="#a75e3c"/>
</g>
<g id="small-gift"><path d="m0 15 103-18 40 28-105 21Z" fill="#8f6876"/><path d="m0 15 103-18v113L0 126Z" fill="url(#plum)"/><path d="m103-3 40 28v116l-40-31Z" fill="#39293b"/><path d="m37 8 17-3v112l-17 3Z" fill="#c6a46a"/><path d="m0 74 103-18 40 30v10l-40-29L0 85Z" fill="#c6a46a"/><path d="M45 8C2-10 14-31 35-18L46 7C61-28 87-18 70-3L46 8" fill="none" stroke="#dfc18b" stroke-width="5" stroke-linecap="round"/></g>
<g id="gourd">
<path d="M-6-71Q-16-100 6-108l12 10Q1-87 8-69" fill="#a59668"/><path d="m1-96 4 23" stroke="#d4be89" stroke-width="2"/>
<ellipse rx="91" ry="71" fill="url(#pumpkin)"/><ellipse cx="-48" rx="31" ry="64" fill="#e4ab6f" opacity=".45"/>
<ellipse rx="43" ry="71" fill="#f0bc7c" opacity=".23"/><path d="M-37-64Q-76 0-34 63M-11-68Q-32 0-9 69M21-67Q46 0 20 68M50-58Q82 0 49 57" fill="none" stroke="#925137" stroke-width="2" opacity=".5"/>
<path d="m-44-9 20-12 2 24Zm64 13 2-24 20 12Z" fill="#432b3b"/><path d="M-29 25q29 33 59 0-30 16-59 0" fill="#432b3b"/><path d="m-24-2 6-5m43 5 5-4" stroke="#f1c081" opacity=".7"/>
</g>
<g id="moth" fill="#c6a46a" opacity=".55"><path d="M0 0C-25-27-41-11-25 5L-4 10C-21 29-9 36 2 13 18 33 32 20 14 8 46 6 42-19 21-12Z"/><path d="m5-3 1 22" stroke="#ead4a9" stroke-width="2"/></g>
`
const versions=[
  {name:'halloween-hero',w:1000,h:1000,moon:[690,265,83],gift:[420,505,1.12],small:[665,695,1.03],gourd:[800,797,1.04],ground:899,branch:[905,872,1.5],left:[77,885,.9],floatShadow:[217,916,175],moth:[315,385,.65]},
  {name:'halloween-hero-mobile',w:1000,h:500,moon:[760,132,53],gift:[510,168,.91],small:[726,308,.72],gourd:[770,401,.65],ground:455,branch:[934,434,.95],left:[89,461,.72],floatShadow:[189,470,126],moth:[366,148,.45]},
  {name:'halloween-hero-tablet',w:1400,h:360,moon:[971,87,48],gift:[680,73,.82],small:[870,191,.62],gourd:[994,267,.62],ground:336,branch:[1200,331,1],left:[222,332,.6],floatShadow:[246,347,158],moth:[522,103,.45]},
]
for(const v of versions){
  const [mx,my,mr]=v.moon
  const stars=[[.29,.16,5],[.46,.29,4],[.6,.11,3],[.85,.36,5],[.39,.48,2],[.9,.61,3],[.21,.34,3],[.73,.46,2]]
  const object=(id,values)=>`<use href="#${id}" transform="translate(${values[0]} ${values[1]}) scale(${values[2]})"/>`
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${v.w} ${v.h}" fill="none">
<defs>${definitions}</defs>
<path fill="url(#sky)" d="M0 0h${v.w}v${v.h}H0Z"/>
<ellipse cx="${v.w*.57}" cy="${v.ground-85}" rx="${v.w*.44}" ry="${v.h*.32}" fill="url(#lamplight)"/>
<path d="M${v.w*.1} ${v.ground-40}Q${v.w*.5} ${v.ground-92} ${v.w*.97} ${v.ground-22}L${v.w} ${v.h}H0Z" fill="#3d303e"/>
<path d="M${v.w*.1} ${v.ground-40}Q${v.w*.5} ${v.ground-92} ${v.w*.97} ${v.ground-22}" stroke="#b28e65" stroke-opacity=".22"/>
<ellipse cx="${mx}" cy="${my}" rx="${mr*2.15}" ry="${mr*2.15}" fill="url(#halo)"/>
<!-- A single crescent path, not two overlapping moon illustrations. -->
<path d="M${mx+mr*.38} ${my-mr*.92}A${mr} ${mr} 0 1 0 ${mx+mr*.75} ${my+mr*.66}A${mr*.82} ${mr*.82} 0 0 1 ${mx+mr*.38} ${my-mr*.92}Z" fill="url(#moon)"/>
<path d="M${mx-mr*.56} ${my-mr*.35}q-${mr*.15} ${mr*.3} 0 ${mr*.56}" stroke="#fff0d4" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>
${stars.map(([x,y,r])=>`<use href="#spark" x="${v.w*x-r}" y="${v.h*y-r}" width="${r*2}" height="${r*2}"/>`).join('')}
<g fill="#c6a46a" opacity=".42">${Array.from({length:18},(_,i)=>`<circle cx="${v.w*(.2+((i*37)%67)/100)}" cy="${v.h*(.14+((i*19)%52)/100)}" r="${i%3===0?1.8:1}"/>`).join('')}</g>
<g stroke="#bca275" stroke-width=".8" opacity=".25"><path d="M${v.w} 0l-144 150M${v.w} 0l-222 33M${v.w} 0l-32 222m-35-190q-21 7-24 31m-36-22q-37 11-44 50m-49-30q-43 14-65 72"/></g>
${object('branch',v.branch)}${object('branch',v.left)}
<ellipse cx="${v.gift[0]+v.gift[2]*100}" cy="${v.gift[1]+v.gift[2]*252}" rx="${v.gift[2]*135}" ry="${v.gift[2]*14}" fill="#1e1926" opacity=".45"/>
<ellipse cx="${v.gourd[0]}" cy="${v.gourd[1]+v.gourd[2]*72}" rx="${v.gourd[2]*102}" ry="${v.gourd[2]*12}" fill="#1e1926" opacity=".4"/>
<ellipse cx="${v.floatShadow[0]}" cy="${v.floatShadow[1]}" rx="${v.floatShadow[2]}" ry="9" fill="#1e1926" opacity=".35"/>
${object('gift',v.gift)}${object('small-gift',v.small)}${object('gourd',v.gourd)}${object('moth',v.moth)}
${object('leaf-shape',[v.w*.64,v.ground+9,.5])}${object('leaf-shape',[v.w*.38,v.ground+15,-.4])}
<path d="M${v.w*.41} ${v.ground+22}q${v.w*.24} 13 ${v.w*.39}-2" stroke="#c6a46a" stroke-opacity=".22"/>
</svg>`
  await writeFile(`public/images/${v.name}.svg`,svg)
  console.log(v.name,Buffer.byteLength(svg),'bytes')
}
