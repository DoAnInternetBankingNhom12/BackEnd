// Services
import { setCache, getCache, deleteCache } from './cache.service';

export function generalOTP() {
  const min = 0;
  const max = 666666;
  let number = Math.abs(Math.floor(Math.random() * (min - max)) + min);
  let OTP: string = number.toString().padStart(6, '0');
  let itemOTP: any = getCache(OTP);

  do {
    number = Math.abs(Math.floor(Math.random() * (min - max)) + min);
    OTP = number.toString().padStart(6, '0');
    itemOTP = getCache(OTP);
  } while (itemOTP)

  OTP = number.toString().padStart(6, '0').toString();
  setCache(OTP, OTP);
  return OTP;
}

export function verifyOTP(OTP: string) {
  let itemOTP: any = getCache(OTP);

  if (itemOTP) {
    deleteCache(OTP);
    return true;
  }

  return false;
}