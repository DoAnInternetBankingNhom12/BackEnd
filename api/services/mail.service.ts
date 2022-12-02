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

export function sendMail(user: User, OTP: string) {
  return new Promise((resolve) => {
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Email OTP mã xác thực FTB BANK',
      html: `<p>Thân gửi tài khoản ${user.userName}!\n</p><h2>Chúng tôi là FTB BANK</h2><p>Bạn đã chọn email ${user.email} để nhận mã xác thực của chúng tôi. Mã xác thực là:\n</p><h1>${OTP}</h1><p>Mã xác thực này chỉ có hiệu lực trong vòng <b>5 phút</b>!</p>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('Email error', error);
        resolve({
          success: false,
          err: error
        });
      } else {
        resolve({
          success: true,
          mgs: `Email sent: ${info.response}`
        });
      }
    });
  });
}

export function sendPassMail(user: User, pass: string) {
  return new Promise((resolve) => {
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Email mã đăng nhập FTB BANK',
      html: `<p>Thân gửi tài khoản ${user.userName}!\n</p><h2>Chúng tôi là FTB BANK</h2><p>Bạn đã chọn email ${user.email} để nhận mã đăng nhập của chúng tôi. Mã đăng nhập là:\n</p><h1>${pass}</h1><p>Yêu cầu tài khoản ${user.userName} đổi mật khẩu sau lần đăng nhập đầu tiên!</p>\n<p>Nếu có vấn đề gì liên quan đến mặt khẩu mặc định không được đổi chúng tôi sẽ không chịu trách nhiệm!</p>\n<h3>Xin cảm ơn!</h3>\n<h2>FTP BANK</h2>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('Email error', error);
        resolve({
          success: false,
          err: error
        });
      } else {
        resolve({
          success: true,
          mgs: `Email sent: ${info.response}`
        });
      }
    });
  });
}