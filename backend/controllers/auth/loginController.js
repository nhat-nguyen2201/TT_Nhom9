// controllers/authController.js
const db = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const login = async (req, res) => {
  const { phone_email, password } = req.body;

  // Đảm bảo password luôn là chuỗi

  if (!phone_email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Vui lòng cung cấp email/số điện thoại và mật khẩu",
    });
  }

  try {
    const [rows] = await db.execute(
      `SELECT id, full_name, email, phone, password_hash, role
       FROM users 
       WHERE email = ? OR phone = ?
       LIMIT 1`,
      [phone_email, phone_email]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Sai thông tin đăng nhập!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Sai thông tin đăng nhập!",
      });
    }

    // Tạo token
    const token = jwt.sign(
      {
        id: user.id,
        full_name: user.full_name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Ẩn password
    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    return res.status(200).json({
      status: "success",
      message: "Đăng nhập thành công",
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
