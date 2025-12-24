// controllers/authController.js
const db = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const login = async (req, res) => {
  // Cho phép đăng nhập bằng email, phone, hoặc phone_email (tương thích mọi frontend)
  const identifier = req.body.email || req.body.phone || req.body.phone_email;
  const password = req.body.password;

  if (!identifier || !password) {
    return res.status(400).json({
      status: "error",
      message: "Vui lòng cung cấp email/số điện thoại và mật khẩu",
    });
  }

  try {
    const [rows] = await db.execute(
      `SELECT user_id, full_name, email, phone, password_hash, role, 
              is_active, email_verified, avatar
       FROM users 
       WHERE email = ? OR phone = ?
       LIMIT 1`,
      [identifier, identifier]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Sai thông tin đăng nhập!",
      });
    }

    if (user.is_active === 0) {
      return res.status(403).json({
        status: "error",
        message:
          "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      });
    }

    const isMatch = await bcrypt.compare(String(password), user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Sai thông tin đăng nhập!",
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        email_verified: user.email_verified,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar || null,
      is_active: user.is_active,
      email_verified: user.email_verified,
    };
    try {
      await db.execute(
        "UPDATE users SET last_active = NOW(), last_login = NOW() WHERE user_id = ?",
        [user.user_id]
      );
    } catch (updateError) {
      console.error("Lỗi cập nhật last_active / last_login:", updateError);
      // Không throw error để không chặn đăng nhập
    }
    return res.status(200).json({
      status: "success",
      message: "Đăng nhập thành công!",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Lỗi login:", err);
    return res.status(500).json({
      status: "error",
      message: "Lỗi máy chủ, vui lòng thử lại sau",
    });
  }
};

module.exports = { login };
