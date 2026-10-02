import {z} from 'zod'
import {localeCodes,marketCodes} from '../types'
export const eventIds=['halloween-2026','black-friday-2026','holiday-2026'] as const
export const slugSchema=z.string().min(4).max(64).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const text=z.string().trim().min(12).max(6000)
const localized=z.object({'en-gb':text,'de-de':text,'fr-fr':text}).strict()
export const brandEditSchema=z.object({summary:localized,introduction:localized,selectionNote:localized,coverProductId:z.string().min(1)}).strict()
export const paidChecklistSchema=z.object({programme:z.boolean(),channel:z.boolean(),brandBidding:z.boolean(),market:z.boolean(),destination:z.boolean()}).strict()
export const redirectInputSchema=z.object({slug:slugSchema,brandId:z.string().min(1),locale:z.enum(localeCodes),market:z.enum(marketCodes),eventId:z.enum(eventIds).nullable(),channel:z.enum(['website','google','meta','email','social','other']),campaignLabel:z.string().trim().min(4).max(120),expiresAt:z.iso.datetime().nullable(),checklist:paidChecklistSchema}).strict()
export const contentSchema=z.object({schemaVersion:z.literal(1),activeEventId:z.enum(eventIds),brands:z.record(z.string(),brandEditSchema),brandLinkStates:z.record(z.string(),z.enum(['active','paused'])).default({}),eventPriority:z.object({'halloween-2026':z.array(z.string()),'black-friday-2026':z.array(z.string()),'holiday-2026':z.array(z.string())}).strict(),campaigns:z.array(redirectInputSchema.extend({id:z.string(),status:z.literal('active')})),humanReview:z.literal('pending')}).strict()
export type BrandEdit=z.infer<typeof brandEditSchema>
export type ManagedContent=z.infer<typeof contentSchema>
export type RedirectInput=z.infer<typeof redirectInputSchema>
export const customRedirectInputSchema=z.object({kind:z.literal('custom'),affiliateUrl:z.string().min(1).max(4096),slug:slugSchema,campaignLabel:z.string().trim().max(120).optional(),channel:z.enum(['website','google','meta','email','social','other']).default('other'),expiresAt:z.iso.datetime().nullable().default(null)}).strict()
export type CustomRedirectInput=z.infer<typeof customRedirectInputSchema>
export type LinkStatus='active'|'paused'|'archived'
interface LinkIdentity {id:string;status:LinkStatus;system:boolean;createdAt:string;affiliateUrl:string;hostname:string}
export interface BrandRedirectLink extends RedirectInput,LinkIdentity {kind:'brand'}
export interface CustomRedirectLink extends Omit<CustomRedirectInput,'campaignLabel'>,LinkIdentity {campaignLabel:string}
export type RedirectLink=BrandRedirectLink|CustomRedirectLink
export interface ContentRevision {schemaVersion:1;id:string;content:ManagedContent;createdAt:string;status:'queued'|'building'|'failed'|'published'}
export {systemRedirectId,brandRedirectPath} from "../redirect-path"

