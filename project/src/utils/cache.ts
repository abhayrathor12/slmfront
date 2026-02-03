const cache = new Map<string, any>();

export const getCache = (key: string) => cache.get(key);
export const setCache = (key: string, value: any) => cache.set(key, value);
export const hasCache = (key: string) => cache.has(key);
