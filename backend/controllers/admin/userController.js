// backend/controllers/admin/userController.js
const db = require("../../config/db");

const getUsers = async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT id, full_name, email, phone, role, is_verified AS is_blocked, created_at 
      FROM users ORDER BY created_at DESC
    `);
    res.json(users);
  } catch (err) {
    console.error("Lỗi khi khóa/mở user:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const blockUser = async (req, res) => {
  const { id } = req.params;
  const { is_blocked } = req.body; // true = khóa, false = mở

  try {
    await db.execute("UPDATE users SET is_blocked = ? WHERE id = ?", [
      is_blocked ? 1 : 0,
      id,
    ]);
    res.json({
      message: is_blocked ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
    });
  } catch (err) {
    console.error("Lỗi khi khóa/mở user:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = { getUsers, blockUser };
