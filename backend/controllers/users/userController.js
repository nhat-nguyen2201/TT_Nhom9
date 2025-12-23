// controllers/users/userController.js
const db = require("../../config/db");

const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await db.execute(
      `SELECT user_id, full_name, email, phone, role, avatar, created_at 
       FROM users WHERE user_id = ? AND is_active = 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const getPackages = async (req, res) => {
  try {
    const [packages] = await db.execute(`
      SELECT package_id, package_name, price, duration_days, max_posts, description 
      FROM packages ORDER BY price ASC
    `);

    res.json({ success: true, data: packages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi lấy danh sách gói" });
  }
};

module.exports = {
  getUserProfile,
  getPackages,
};