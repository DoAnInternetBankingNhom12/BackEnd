import * as NodeCache from 'node-cache';
const cache = new NodeCache( { stdTTL: 300 } )


export function setCache(key: string, value: any) {
  cache.set(key, value);
}

export function getCache(key: string) {
  return cache.get(key);
}

export function getTtl(key: string) {
  return cache.getTtl(key);
}

export function getAllKeys() {
  return cache.keys();
}
