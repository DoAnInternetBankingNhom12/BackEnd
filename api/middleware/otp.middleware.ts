import { Request, Response } from 'express';

// Services
import { verifyOTP } from '../services/otp.service';

// Utils
import { isNull } from '../utils/utils';

const verifyOtp = async (req: Request, res: Response, next: any) => {
  try {
    const OTP: any = req.headers?.otp as String;

    if (isNull(OTP)) {
      return res.status(403).json(
        {
          mgs: 'A OTP is required!',
          success: false
        });
    }

    const status = await verifyOTP(OTP);
    if (!status) {
      return res.status(403).json(
        {
          mgs: 'Wrong OTP!',
          success: false
        });
    }
  } catch (err) {
    return res.status(401).json({
      mgs: 'Invalid OTP!',
      success: false,
      error: err
    });
  }

  return next();
};

export default verifyOtp;
