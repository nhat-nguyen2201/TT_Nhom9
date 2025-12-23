// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/authAdmin");

// Import controllers
const { getStats } = require("../controllers/admin/statsController");
const {
  getUsers,
  blockUser,
  createUserByAdmin,
} = require("../controllers/admin/userController");

// Import từng hàm cụ thể từ adminPostController để dễ đọc và tránh lỗi
const {
  getAllPosts,
  getPostById,
  // nếu có dùng full update
  updatePostStatus,
  deletePost,
} = require("../controllers/admin/adminPostController");

// Thống kê dashboard
router.get("/stats", adminAuth, getStats);

// Quản lý người dùng
router.get("/users", adminAuth, getUsers);
router.patch("/users/:id/block", adminAuth, blockUser);

// === QUẢN LÝ BÀI ĐĂNG ADMIN ===
router.get("/posts", adminAuth, getAllPosts); // Danh sách + phân trang + tìm kiếm
router.get("/posts/:id", adminAuth, getPostById); // Chi tiết bài

router.patch("/posts/:id/status", adminAuth, updatePostStatus); // Duyệt / Từ chối
router.delete("/posts/:id", adminAuth, deletePost); // Xóa bài
router.post("/users", adminAuth, createUserByAdmin);
module.exports = router;
