// backend/controllers/admin/statsController.js
const db = require("../../config/db");

const getStats = async (req, res) => {
  try {
    // 1. Tổng người dùng
    const [users] = await db.execute("SELECT COUNT(*) as count FROM users");
    const totalUsers = users[0].count;

    // 2. Người dùng hoạt động (giả sử có cột last_active hoặc created_at gần đây)
    const [activeUsers] = await db.execute(`
      SELECT COUNT(*) AS count
      FROM users
      WHERE COALESCE(last_active, created_at) > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);
    // 3. Tổng bài đăng
    const [posts] = await db.execute("SELECT COUNT(*) as count FROM posts");
    const totalPosts = posts[0].count;

    // 4. Bài đăng chờ duyệt (pending)
    const [pendingPosts] = await db.execute(`
      SELECT COUNT(*) AS count
      FROM posts
      WHERE COALESCE(status, 'approved') = 'pending'
    `);

    // 5. Doanh thu hôm nay (từ bảng transactions, giả sử có cột amount và created_at)
    const [todayRevenue] = await db.execute(
      "SELECT COALESCE(SUM(amount), 0) AS revenue FROM transactions WHERE DATE(completed_at) = CURDATE() AND payment_status = 'completed'"
    );

    // 6. Các gói nổi bật / tổng gói (từ packages)
    const [packages] = await db.execute(
      "SELECT COUNT(*) as count FROM packages"
    );

    // 7. Hoạt động gần đây (lấy 5-10 bản ghi mới nhất từ posts hoặc transactions hoặc users)
    const [recentActivities] = await db.execute(
      `SELECT 'Tạo bài đăng' as action, u.full_name as user, p.title as target, p.created_at 
       FROM posts p 
       JOIN users u ON p.landlord_id = u.user_id 
       ORDER BY p.created_at DESC LIMIT 8`
    );
 
    // 8. Phiên đăng nhập hôm nay
    const [sessionsTodayResult] = await db.execute(`
      SELECT COUNT(*) AS count 
      FROM users 
      WHERE DATE(last_login) = CURDATE()
    `);
    const sessionsToday = sessionsTodayResult[0].count || 0;
    // Format dữ liệu phù hợp frontend
    res.json({
      activeUsers: activeUsers[0].count || 0,
      sessionsToday: Number(sessionsToday) || 0,
      totalOrders: totalPosts, // hoặc đếm transactions
      todayRevenue: todayRevenue[0].revenue || 0,
      totalUsers: totalUsers,
      totalPosts: totalPosts,
      pendingPosts: pendingPosts[0].count || 0,
      packagesCount: packages[0].count || 0,
      recentActivities: recentActivities.map((act) => ({
        id: Math.random().toString(36).substr(2, 9),
        action: act.action,
        user: act.user,
        target: act.target,
        time: new Date(act.created_at).toLocaleString("vi-VN"),
        type: "info", // hoặc logic để phân loại success/warning/danger
      })),
    });
  } catch (err) {
    console.error("Lỗi stats:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

module.exports = { getStats };
