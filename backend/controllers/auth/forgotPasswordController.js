// controllers/auth/forgotPasswordController.js
const crypto = require("crypto");
const db = require("../../config/db");
const { sendResetPasswordEmail } = require("../../utils/sendMail");

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email || !email.includes("@")) {
    return res.status(400).json({
      status: "error",
      message: "Vui lòng nhập email hợp lệ!",
    });
  }

  try {
    const [users] = await db.query(
      `SELECT user_id, email, full_name FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!users.length) {
      return res.json({
        status: "success",
        message:
          "Nếu tài khoản tồn tại, link đặt lại mật khẩu đã được gửi đến email của bạn.",
      });
    }

    const user = users[0];

    // Tạo token và thời hạn
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    // Lưu vào DB
    await db.query(
      `UPDATE users 
       SET reset_password_token = ?, reset_password_expires = ? 
       WHERE user_id = ?`,
      [token, expires, user.user_id]
    );

    // Link đặt lại
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    // GỬI EMAIL THẬT
    await sendResetPasswordEmail(
      user.email,
      resetLink,
      user.full_name || "bạn"
    );

    // In ra console để test nhanh
    console.log("LINK ĐẶT LẠI MẬT KHẨU:");
    console.log(resetLink);
    console.log("".padStart(60, "-"));

    return res.json({
      status: "success",
      message: "Link đặt lại mật khẩu đã được gửi đến email của bạn!",
    });
  } catch (err) {
    console.error("Lỗi forgot-password:", err);
    return res.status(500).json({
      status: "error",
      message: "Đã có lỗi xảy ra, vui lòng thử lại sau.",
    });
  }
};

module.exports = { forgotPassword };
