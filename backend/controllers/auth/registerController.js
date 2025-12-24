// controllers/auth/registerController.js
const db = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const register = async (req, res) => {
  const { full_name, email, phone, password, confirm_password, role } =
    req.body;

  console.log("Request đăng ký:", req.body);

  // Chuẩn hóa dữ liệu
  const finalFullName = full_name?.trim();
  const finalEmail = email?.trim().toLowerCase();
  // Loại bỏ khoảng trắng thừa trong số điện thoại nếu có
  const finalPhone = phone?.toString().replace(/\s/g, "") || null;
  const userRole = role === "landlord" || role === "admin" ? role : "renter";

  // === 1. VALIDATION CƠ BẢN ===
  if (!finalFullName || finalFullName.length < 2) {
    return res.status(400).json({
      status: "error",
      message: "Vui lòng nhập họ và tên!",
    });
  }

  if (!finalEmail || !/^\S+@\S+\.\S+$/.test(finalEmail)) {
    return res.status(400).json({
      status: "error",
      message: "Email không hợp lệ!",
    });
  }

  // === 2. VALIDATION SỐ ĐIỆN THOẠI (MỚI) ===
  // Nếu người dùng có nhập SĐT thì mới kiểm tra
  if (finalPhone) {
    // Regex: Bắt đầu bằng số 0, theo sau là 9 chữ số bất kỳ (tổng 10 số)
    const vnf_regex = /^0\d{9}$/;

    if (!vnf_regex.test(finalPhone)) {
      return res.status(400).json({
        status: "error",
        message:
          "Số điện thoại không hợp lệ! (Phải bắt đầu bằng số 0 và đủ 10 số)",
      });
    }
  }

  // === 3. VALIDATION MẬT KHẨU (ĐÃ TỐI ƯU) ===
  // Regex: Ít nhất 6 ký tự, 1 chữ hoa, 1 ký tự đặc biệt
  const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{6,}$/;

  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({
      status: "error",
      message:
        "Mật khẩu phải có ít nhất 6 ký tự, bao gồm 1 chữ hoa và 1 ký tự đặc biệt!",
    });
  }

  if (password !== confirm_password) {
    return res.status(400).json({
      status: "error",
      message: "Mật khẩu xác nhận không khớp!",
    });
  }

  try {
    // Kiểm tra email đã tồn tại chưa
    const [existingEmail] = await db.execute(
      "SELECT user_id FROM users WHERE email = ?",
      [finalEmail]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Email này đã được sử dụng!",
      });
    }

    // Kiểm tra trùng phone (nếu có)
    if (finalPhone) {
      const [existingPhone] = await db.execute(
        "SELECT user_id FROM users WHERE phone = ?",
        [finalPhone]
      );
      if (existingPhone.length > 0) {
        return res.status(400).json({
          status: "error",
          message: "Số điện thoại này đã được sử dụng bởi tài khoản khác!",
        });
      }
    }

    // Hash mật khẩu
    const password_hash = await bcrypt.hash(password, 10);

    // Thêm người dùng mới
    const [result] = await db.execute(
      `INSERT INTO users 
          (full_name, email, phone, password_hash, role, created_at, updated_at) 
        VALUES 
          (?, ?, ?, ?, ?, NOW(), NOW())`,
      [finalFullName, finalEmail, finalPhone, password_hash, userRole]
    );

    const newUserId = result.insertId;

    // Tạo token
    const token = jwt.sign(
      { user_id: newUserId, role: userRole, email: finalEmail },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      status: "success",
      message: "Đăng ký thành công! Chào mừng bạn đến TroTot",
      token,
      user: {
        user_id: newUserId,
        full_name: finalFullName,
        email: finalEmail,
        phone: finalPhone,
        role: userRole,
      },
    });
  } catch (err) {
    console.error("Lỗi đăng ký:", err);
    return res.status(500).json({
      status: "error",
      message: "Lỗi hệ thống, vui lòng thử lại sau!",
    });
  }
};

module.exports = { register };
