// Services
import { isNull } from 'lodash';
import { setCache, getCache, findCacheData, deleteCache } from './cache.service';

export function generalOTP(userId: string) {
  let itemOTP: any = getCache(userId);

  if (itemOTP) {
    return itemOTP;
  }

  const min = 0;
  const max = 666666;
  let number = Math.abs(Math.floor(Math.random() * (min - max)) + min);
  let OTP: string = number.toString().padStart(6, '0');

  do {
    number = Math.abs(Math.floor(Math.random() * (min - max)) + min);
    OTP = number.toString().padStart(6, '0');
    itemOTP = getCache(userId);
  } while (itemOTP === OTP)

  OTP = number.toString().padStart(6, '0').toString();
  setCache(userId, OTP);
  return OTP;
}

export async function verifyOTP(OTP: string) {
  const itemOTP: any = await findCacheData(OTP);
  if (itemOTP && !isNull(itemOTP.key)) {
    deleteCache(itemOTP.key);
    return true;
  }

  return false;
}