import * as NodeCache from 'node-cache';
const cache = new NodeCache( { stdTTL: 300 } ); // 5m
// const cache = new NodeCache( { stdTTL: 10 } ); // 10s


export function setCache(key: string, value: any) {
  cache.set(key, value);
}

export function getCache(key: string) {
  return cache.get(key);
}

export function getTtl(key: string) {
  return cache.getTtl(key);
}

export function getKeys() {
  return cache.keys();
}

export function deleteCache(key: string) {
  cache.del(key);
}
