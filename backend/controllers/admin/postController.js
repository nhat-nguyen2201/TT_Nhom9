// backend/controllers/admin/postController.js
const db = require("../../config/db");

const getPosts = async (req, res) => {
  try {
    const [posts] = await db.execute(`
      SELECT p.*, u.full_name as owner_name 
      FROM posts p 
      LEFT JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
    `);
    res.json(posts);
  } catch (err) {
    console.error("Lỗi khi khóa/mở user:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const approvePost = async (req, res) => {
  await db.execute("UPDATE posts SET status = 'approved' WHERE id = ?", [
    req.params.id,
  ]);
  res.json({ message: "Đã duyệt tin" });
};

const rejectPost = async (req, res) => {
  await db.execute("UPDATE posts SET status = 'rejected' WHERE id = ?", [
    req.params.id,
  ]);
  res.json({ message: "Đã từ chối tin" });
};

const deletePost = async (req, res) => {
  await db.execute("DELETE FROM posts WHERE id = ?", [req.params.id]);
  res.json({ message: "Đã xóa tin" });
};

module.exports = { getPosts, approvePost, rejectPost, deletePost };
