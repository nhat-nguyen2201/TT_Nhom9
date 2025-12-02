// controllers/auth/registerController.js
const db = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const register = async (req, res) => {
  const { full_name, email, phone, password, confirm_password } = req.body;

 
  console.log("Request đăng ký nhận được:", req.body);

 
  const finalEmail =
    email && email.trim() !== "" ? email.trim().toLowerCase() : null;
  const finalPhone =
    phone && phone.toString().trim() !== "" && phone !== "null"
      ? phone.trim()
      : null;

  // Validation
  if (!full_name || !full_name.trim()) {
    return res.status(400).json({
      status: "error",
      message: "Vui lòng nhập họ và tên!",
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      status: "error",
      message: "Mật khẩu phải có ít nhất 6 ký tự!",
    });
  }

  if (password !== confirm_password) {
    return res.status(400).json({
      status: "error",
      message: "Mật khẩu xác nhận không khớp!",
    });
  }

  if (!finalEmail && !finalPhone) {
    return res.status(400).json({
      status: "error",
      message: "Vui lòng cung cấp email hoặc số điện thoại!",
    });
  }

  try {
    // Kiểm tra trùng
    let query = "SELECT id FROM users WHERE ";
    let params = [];
    if (finalEmail && finalPhone) {
      query += "email = ? OR phone = ?";
      params = [finalEmail, finalPhone];
    } else if (finalEmail) {
      query += "email = ?";
      params = [finalEmail];
    } else {
      query += "phone = ?";
      params = [finalPhone];
    }

    const [existingUser] = await db.execute(query, params);
    if (existingUser.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Email hoặc số điện thoại đã được sử dụng!",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.execute(
      `INSERT INTO users (full_name, email, phone, password_hash, role, created_at) 
       VALUES (?, ?, ?, ?, 'tenant', NOW())`,
      [full_name.trim(), finalEmail, finalPhone, password_hash]
    );

    const newUserId = result.insertId;

    // Tạo token
    const token = jwt.sign(
      { id: newUserId, full_name: full_name.trim(), role: "tenant" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = {
      id: newUserId,
      full_name: full_name.trim(),
      email: finalEmail,
      phone: finalPhone,
      role: "tenant",
    };

    console.log("Đăng ký thành công user ID:", newUserId);

    return res.status(201).json({
      status: "success",
      message: "Đăng ký thành công! Đã đăng nhập tự động",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Lỗi đăng ký:", err);
    return res.status(500).json({
      status: "error",
      message: "Lỗi máy chủ, vui lòng thử lại sau",
    });
  }
};

module.exports = { register };
