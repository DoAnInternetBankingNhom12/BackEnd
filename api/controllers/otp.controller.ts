import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

// Models
import UserModel from '../models/user';

// Services
import { generalOTP } from '../services/otp.service';
import { sendMail } from '../services/mail.service';

// Utils
import { isNull } from '../utils/utils';
import * as lodash from 'lodash';

// Interfaces
import { User } from 'interfaces/user.interface';

class OTPCtrl {

  modelUser = UserModel;

  // Send OTP
  sendOtp = async (req: Request, res: Response) => {
    try {
      const token: any = req.headers?.authorization?.replace('Bearer ', '');

      if (isNull(token)) {
        return res.status(400).json({
          mgs: `Token does not exist!`,
          success: false
        });
      }

      const user: User = jwt.decode(token) as any;

      if (isNull(user)) {
        return res.status(400).json({
          mgs: `No user information!`,
          success: false
        });
      }

      const OTP = generalOTP(user.userId);

      if (isNull(OTP)) {
        return res.status(400).json({
          mgs: `Can't create OTP!`,
          success: false
        });
      }

      const statusSendMail: any = await sendMail(user, OTP);

      if (statusSendMail && statusSendMail.success) {
        return res.status(200).json({
          mgs: `Sent OTP success!`,
          success: true
        });
      }

      return res.status(400).json({
        mgs: `Sent OTP failure!`,
        success: false,
        error: statusSendMail.error
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Sent OTP error!`,
        success: false,
        error: err
      });
    }
  };

  sendOtpByUserName = async (req: Request, res: Response) => {
    try {
      const { userName } = lodash.cloneDeep(req.params);

      if (isNull(userName)) {
        return res.status(400).json({
          mgs: `User name in null!`,
          success: false
        });
      }

      const user: any = await this.modelUser.findOne({ userName }, { _id: 0, __v: 0, _status: 0, password: 0 });

      if (isNull(user)) {
        return res.status(400).json({
          mgs: `No user information!`,
          success: false
        });
      }

      const OTP = generalOTP(user.id);

      if (isNull(OTP)) {
        return res.status(400).json({
          mgs: `Can't create OTP!`,
          success: false
        });
      }

      const statusSendMail: any = await sendMail(user, OTP);

      if (statusSendMail && statusSendMail.success) {
        return res.status(200).json({
          mgs: `Sent OTP success!`,
          success: true
        });
      }

      return res.status(400).json({
        mgs: `Sent OTP failure!`,
        success: false,
        error: statusSendMail.error
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Sent OTP error!`,
        success: false,
        error: err
      });
    }
  };
}

export default OTPCtrl;
