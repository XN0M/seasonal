export function systemRedirectId(brandId:string){return `brand-${brandId}`}
export function brandRedirectPath(brandId:string){return `/r/${systemRedirectId(brandId)}`}
