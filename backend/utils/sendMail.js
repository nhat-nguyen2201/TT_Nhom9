// utils/sendMail.js
require("dotenv").config();
const nodemailer = require("nodemailer");

// Tạo transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Hàm gửi email
const sendResetPasswordEmail = async (toEmail, resetLink, fullName = "bạn") => {
  try {
    await transporter.sendMail({
      from: `"Hệ thống thuê trọ" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Đặt lại mật khẩu tài khoản",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; text-align: center;">
          <h2 style="color: #c62828;">Xin chào ${fullName}!</h2>
          <p>Click nút dưới đây để đặt lại mật khẩu (hết hạn sau 1 giờ):</p>
          <a href="${resetLink}" style="background:#c62828; color:white; padding:10px 40px; text-decoration:none; border-radius:50px; font-weight:bold;">
            Đặt lại mật khẩu
          </a>
          <p style="margin-top:20px; font-size:12px; color:#666;">
            Hoặc copy link: <br> <a href="${resetLink}">${resetLink}</a>
          </p>                                              
        </div>
      `,
    });
    console.log("Đã gửi email thành công đến:", toEmail);
  } catch (error) {
    console.error("Lỗi gửi email:", error.message);
    throw error;
  }
};

module.exports = { sendResetPasswordEmail };
