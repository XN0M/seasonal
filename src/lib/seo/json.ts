export const serialiseJsonLd = (data:Record<string,unknown>) => JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026')
