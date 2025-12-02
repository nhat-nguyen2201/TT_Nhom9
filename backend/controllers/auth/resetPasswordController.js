// controllers/auth/resetPasswordController.js

const bcrypt = require("bcryptjs");
const db = require("../../config/db"); 

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  // Validate đầu vào
  if (!token || !password || password.length < 6) {
    return res.status(400).json({
      status: "error",
      message: "Mật khẩu phải có ít nhất 6 ký tự",
    });
  }

  try {
    // Tìm user có token hợp lệ và chưa hết hạn
    const [users] = await db.query(
      `SELECT * FROM users 
       WHERE reset_password_token = ? 
         AND reset_password_expires > NOW()
       LIMIT 1`,
      [token]
    );

    if (!users.length) {
      return res.status(400).json({
        status: "error",
        message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!",
      });
    }

    const user = users[0];

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cập nhật mật khẩu + xóa token (để không dùng lại)
    await db.query(
      `UPDATE users 
       SET password_hash = ?, 
           reset_password_token = NULL, 
           reset_password_expires = NULL 
       WHERE id = ?`,
      [hashedPassword, user.id]
    );

    // Thành công!
    return res.json({
      status: "success",
      message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.",
    });
  } catch (err) {
    console.error("Lỗi reset password:", err);
    return res.status(500).json({
      status: "error",
      message: "Có lỗi xảy ra, vui lòng thử lại sau.",
    });
  }
};

// XUẤT RA ĐỂ ROUTE DÙNG
module.exports = { resetPassword };
