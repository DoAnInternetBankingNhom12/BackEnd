import * as NodeCache from 'node-cache';

// Utils
import * as lodash from 'lodash';
import { isNull } from '../utils/utils';

const cache = new NodeCache({ stdTTL: 300 }); // 5m

export function setCache(key: string, value: any) {
  cache.set(key, value);
}

export function getCache(key: string) {
  return cache.get(key);
}

export function findCacheData(value: any) {
  return new Promise((resolve) => {
    const cacheData = lodash.cloneDeep(cache.data);
    const values = Object.keys(cacheData).map((key: string) => {
      const item = cacheData[key];
      if (item && item.v) {
        return {
          key: key,
          value: item.v
        };
      }
      return;
    });

    const item = values.find((d: any) => d.value === value);
    if (item && !isNull(item.key)) {
      resolve(item);
    }

    resolve(undefined);
  });
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
