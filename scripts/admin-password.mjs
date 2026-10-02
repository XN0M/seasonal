// Reads a password only from stdin, never command-line arguments or environment.
// Produces an ignored credential SQL file, not plaintext credentials.
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {scrypt,randomBytes} from 'node:crypto'
const content=await readFile('.dev.vars','utf8')
const email=/^OWNER_EMAIL=(.+)$/m.exec(content)?.[1]?.trim()
if(!email||!/^\S+@\S+\.\S+$/.test(email))throw new Error('Set OWNER_EMAIL in ignored .dev.vars first')
let input='';for await(const chunk of process.stdin){input+=chunk;if(Buffer.byteLength(input)>8192)throw new Error('Input too large')}
let parsed;try{parsed=JSON.parse(input)}catch{throw new Error('Invalid credential input')}
const {password}=parsed??{};input=''
if(typeof password!=='string'||password.length<1||password.length>128||Buffer.byteLength(password)>512)throw new Error('Choose a non-empty password with 1–128 characters')
const salt=randomBytes(16).toString('hex'),key=await new Promise((resolve,reject)=>scrypt(password,Buffer.from(salt,'hex'),32,{N:16384,r:8,p:5,maxmem:32*1024*1024},(error,key)=>error?reject(error):resolve(key)))
const hash='scrypt$16384$8$5$'+salt+'$'+key.toString('hex')
const quote=value=>"'"+value.replaceAll("'","''")+"'"
const sql=`BEGIN TRANSACTION;
INSERT INTO admin_credentials VALUES ('owner',${quote(email)},${quote(hash)},1,${quote(new Date().toISOString())}) ON CONFLICT(id) DO UPDATE SET email=excluded.email,password_hash=excluded.password_hash,version=version+1,updated_at=excluded.updated_at;
DELETE FROM admin_sessions;
DELETE FROM admin_login_limit;
INSERT INTO audit VALUES (${quote(randomBytes(16).toString('hex'))},${quote(new Date().toISOString())},'operator-password-reset','owner','Operator reset; all sessions revoked; no password in audit');
COMMIT;
`
await mkdir('.wrangler/tools',{recursive:true})
await writeFile('.wrangler/tools/owner-password.sql',sql,{mode:0o600})
console.log('Credential SQL prepared in ignored .wrangler/tools/owner-password.sql. Contains a sensitive salted hash, no plaintext. Do not share or commit it.')
