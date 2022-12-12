import { Request, Response } from 'express';

// Services
import { verifyOTP } from '../services/otp.service';

// Utils
import { isNull } from '../utils/utils';

const verifyOtp = async (req: Request, res: Response, next: any) => {
  console.log(req);
  console.log(res.statusCode);

  return next();
};

export default verifyOtp;
