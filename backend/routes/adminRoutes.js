// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/authAdmin");

// Import controller
const { getStats } = require("../controllers/admin/statsController");
const { getUsers, blockUser } = require("../controllers/admin/userController");
const { getPosts, approvePost, rejectPost, deletePost } = require("../controllers/admin/postController");

// Thống kê
router.get("/stats", adminAuth, getStats);

// Quản lý người dùng
router.get("/users", adminAuth, getUsers);
router.patch("/users/:id/block", adminAuth, blockUser);

// Quản lý tin đăng
router.get("/posts", adminAuth, getPosts);
router.patch("/posts/:id/approve", adminAuth, approvePost);
router.patch("/posts/:id/reject", adminAuth, rejectPost);
router.delete("/posts/:id", adminAuth, deletePost);

module.exports = router;