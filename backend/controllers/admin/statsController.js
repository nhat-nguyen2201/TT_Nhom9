// backend/controllers/admin/statsController.js
const db = require("../../config/db");

const getStats = async (req, res) => {
  try {
    const [users] = await db.execute("SELECT COUNT(*) as count FROM users");
    const [posts] = await db.execute("SELECT COUNT(*) as count FROM posts");
    const [pending] = await db.execute(
      "SELECT COUNT(*) as count FROM posts WHERE status = 'pending'"
    );
    const [reported] = await db.execute(
      "SELECT COUNT(*) as count FROM posts WHERE reported = 1"
    );

    res.json({
      totalUsers: users[0].count,
      totalPosts: posts[0].count,
      pendingPosts: pending[0].count,
      reportedPosts: reported[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = { getStats };
