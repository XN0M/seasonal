export interface Statement {
 bind(...values:unknown[]):Statement
 first<T>():Promise<T|null>
 all<T>():Promise<{results:T[]}>
 run():Promise<{meta:{changes:number}}>
}
export interface Database {prepare(sql:string):Statement;batch<T=unknown>(statements:Statement[]):Promise<T[]>}
export interface Env {
 DB:Database;ASSETS:{fetch(request:Request):Promise<Response>}
 ADMIN_ORIGIN?:string;ACCESS_TEAM?:string;ACCESS_AUD?:string;OWNER_EMAIL?:string;CSRF_SECRET?:string
 ADMIN_AUTH_MODE?:'access'|'password';ADMIN_LOCAL_SETUP?:string
 REDIRECT_SELF_HOSTS?:string
 BUILD_ACCESS_AUD?:string;BUILD_SERVICE_SUB?:string;GITHUB_TOKEN?:string;GITHUB_REPOSITORY?:string;GITHUB_REF?:string;PUBLISH_ENVIRONMENT?:string
}
export interface Context {waitUntil(promise:Promise<unknown>):void}
export interface LinkRow {id:string;slug:string;brand_id:string|null;locale:string|null;market:string|null;event_id:string|null;channel:string;campaign_label:string;status:'active'|'paused'|'archived';expires_at:string|null;checklist_json:string;system:number;created_at:string;target_kind:'brand'|'custom';destination_url:string|null;destination_hostname:string|null}
