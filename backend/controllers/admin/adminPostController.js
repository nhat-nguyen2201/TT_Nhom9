// controllers/admin/adminPostController.js
const pool = require("../../config/db");

// Lấy tất cả bài đăng cho admin (hỗ trợ phân trang, tìm kiếm, lọc trạng thái + tên người đăng)
const getAllPosts = async (req, res) => {
  const { page = 1, limit = 10, search, status } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT 
      p.*, 
      u.full_name AS landlord_name,
      u.phone AS landlord_phone
    FROM posts p
    LEFT JOIN users u ON p.landlord_id = u.user_id
    WHERE 1=1
  `;

  let countQuery = `
    SELECT COUNT(*) as total 
    FROM posts p
    LEFT JOIN users u ON p.landlord_id = u.user_id
    WHERE 1=1
  `;

  const params = [];
  const countParams = [];

  // Tìm kiếm theo tiêu đề hoặc địa chỉ
  if (search) {
    const like = `%${search}%`;
    query +=
      " AND (p.title LIKE ? OR p.address LIKE ? OR p.district LIKE ? OR p.city LIKE ?)";
    countQuery +=
      " AND (p.title LIKE ? OR p.address LIKE ? OR p.district LIKE ? OR p.city LIKE ?)";
    params.push(like, like, like, like);
    countParams.push(like, like, like, like);
  }

  // Lọc theo trạng thái
  if (status) {
    query += " AND p.status = ?";
    countQuery += " AND p.status = ?";
    params.push(status);
    countParams.push(status);
  }

  // Sắp xếp mới nhất trước
  query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  try {
    const [rows] = await pool.query(query, params);
    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.json({
      posts: rows,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching posts for admin:", err);
    res.status(500).json({ error: "Lỗi tải danh sách bài đăng" });
  }
};

// Lấy chi tiết 1 bài đăng (cũng JOIN để có tên người đăng)
const getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        p.*, 
        u.full_name AS landlord_name,
        u.phone AS landlord_phone
      FROM posts p
      LEFT JOIN users u ON p.landlord_id = u.user_id
      WHERE p.post_id = ?
      `,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy bài đăng" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật trạng thái (giữ nguyên - rất tốt)
const updatePostStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // CẬP NHẬT DANH SÁCH TRẠNG THÁI
  const validStatuses = ["pending", "active", "rejected", "expired", "hidden"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Trạng thái không hợp lệ" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE posts SET status = ?, updated_at = NOW() WHERE post_id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy bài đăng" });
    }

    // Trả về dữ liệu để update giao diện ngay lập tức
    const [updated] = await pool.query(
      `SELECT p.*, u.full_name as landlord_name 
         FROM posts p 
         LEFT JOIN users u ON p.landlord_id = u.user_id 
         WHERE p.post_id = ?`,
      [id]
    );

    res.json({
      message: "Cập nhật trạng thái thành công",
      post: updated[0],
    });
  } catch (err) {
    console.error("Error updating post status:", err);
    res.status(500).json({ error: "Lỗi server khi cập nhật trạng thái" });
  }
};

// Xóa bài đăng (giữ nguyên)
const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM posts WHERE post_id = ?", [
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy bài đăng để xóa" });
    }
    res.json({ message: "Xóa bài đăng thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  updatePostStatus,
  deletePost,

};
