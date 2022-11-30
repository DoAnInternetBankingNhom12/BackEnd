import * as nodemailer from 'nodemailer';

// Interface
import { User } from 'interfaces/user.interface';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS_APP
  }
});

const sentMail = (user: User, code: string) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: 'Email OTP mã xác thực FTB bank',
    html: `<p>Thân gửi tài khoản ${user.userName}!\n</p><h2>Chúng tôi là FTB BANK</h2><p>Bạn đã chọn email ${user.email} để nhận mà xác thực của chúng tôi. Mã xác thực là:\n</p><h1>${code}</h1><p>Mã xác thực này chủ có hiệu lực trong vòng 5 phút!</p>`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

}

export default sentMail;