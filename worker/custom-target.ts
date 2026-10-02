import {isIP} from 'node:net'
import type {Env} from './types'

// Parse only to validate. Never return URL.href: attribution must retain the owner's original bytes.
export function customTarget(url:string,env:Pick<Env,'ADMIN_ORIGIN'|'REDIRECT_SELF_HOSTS'>):{url:string;hostname:string}{
 if(url.length>4096||!/^https:\/\//i.test(url)||!/^[\x21-\x7e]+$/.test(url)||url.includes('\\')||url.split(/[/?#]/)[2]?.includes('@'))throw new Error('Invalid affiliate URL: use an encoded HTTPS URL without spaces, credentials or control characters')
 let parsed:URL
 try{parsed=new URL(url)}catch{throw new Error('Invalid affiliate URL')}
 const hostname=parsed.hostname.toLowerCase().replace(/\.$/,'')
 if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.port&&parsed.port!=='443')throw new Error('Invalid affiliate URL: HTTPS without credentials on the standard port required')
 if(isIP(hostname.replace(/^\[|\]$/g,''))||!hostname.includes('.')||hostname.length>253||!hostname.split('.').every(label=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))||/(?:^|\.)(localhost|local|internal|lan|home|onion)$/.test(hostname))throw new Error('Invalid affiliate URL: a public hostname is required')
 const own=['evenal.click','seasonal.xuannam4869.workers.dev',...(env.REDIRECT_SELF_HOSTS??'').split(',').map(value=>value.trim().toLowerCase()).filter(Boolean)]
 if(env.ADMIN_ORIGIN)own.push(new URL(env.ADMIN_ORIGIN).hostname.toLowerCase().replace(/\.$/,''))
 if(own.some(host=>hostname===host||hostname.endsWith('.'+host)))throw new Error('Invalid affiliate URL: destination cannot point back to this website or its Worker')
 return {url,hostname}
}
