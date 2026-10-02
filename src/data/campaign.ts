// Explicit editorial preview selection. Change this ID and rebuild to switch season.
// Do not use the visitor's clock or array ordering to choose a campaign.
import snapshot from '../generated/content.json'
import {validateContent} from '../lib/admin/content'
export const activeEventId: string = snapshot.content===null?'halloween-2026':validateContent(snapshot.content).activeEventId
