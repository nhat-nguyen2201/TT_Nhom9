// backend/controllers/admin/userController.js
const db = require("../../config/db");
const bcrypt = require("bcryptjs");

const getUsers = async (req, res) => {
  try {
   // SỬA: Thêm is_blocked vào danh sách lấy về
    const [users] = await db.execute(`
      SELECT user_id, full_name, email, phone, role, is_blocked, created_at 
      FROM users ORDER BY created_at DESC
    `);
    res.json(users);
  } catch (err) {
    console.error("Lỗi lấy danh sách user:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const blockUser = async (req, res) => {
  const { id } = req.params;
  const { is_blocked } = req.body;

  try {
   
    const [result] = await db.execute(
      "UPDATE users SET is_blocked = ? WHERE user_id = ?",
      [is_blocked ? 1 : 0, id]
    );

    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.json({
      message: is_blocked ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
    });
  } catch (err) {
    console.error("Lỗi khi khóa/mở user:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
const createUserByAdmin = async (req, res) => {
  const { full_name, email, phone, password, role } = req.body;

  if (!full_name || full_name.trim().length < 2) {
    return res.status(400).json({ message: "Họ tên không hợp lệ" });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    return res.status(400).json({ message: "Email không hợp lệ" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Mật khẩu phải ít nhất 6 ký tự" });
  }

  const validRoles = ["renter", "landlord", "admin"];
  const userRole = validRoles.includes(role) ? role : "renter";

  const finalFullName = full_name.trim();
  const finalEmail = email.trim().toLowerCase();
  const finalPhone = phone?.trim() || null;

  try {
 
    const [existingEmail] = await db.execute(
      "SELECT user_id FROM users WHERE email = ?",
      [finalEmail]
    );
    if (existingEmail.length > 0) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

 
    if (finalPhone) {
      const [existingPhone] = await db.execute(
        "SELECT user_id FROM users WHERE phone = ?",
        [finalPhone]
      );
      if (existingPhone.length > 0) {
        return res
          .status(400)
          .json({ message: "Số điện thoại đã được sử dụng" });
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user mới
    const [result] = await db.execute(
      `INSERT INTO users (full_name, email, phone, password_hash, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [finalFullName, finalEmail, finalPhone, password_hash, userRole]
    );

    res.status(201).json({
      message: "Tạo tài khoản thành công!",
      user: {
        user_id: result.insertId,
        full_name: finalFullName,
        email: finalEmail,
        phone: finalPhone,
        role: userRole,
      },
    });
  } catch (err) {
    console.error("Lỗi tạo user bởi admin:", err);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
module.exports = { getUsers, blockUser, createUserByAdmin };
