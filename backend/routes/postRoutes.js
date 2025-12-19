// src/routes/postRoutes.js
const express = require("express");
const router = express.Router();

// Controllers
const {
  createPost,
  getSuggestedPosts,
} = require("../controllers/post/postController");

// Middleware
const upload = require("../utils/upLoadImage");
const auth = require("../middleware/authMiddleware");

// Tạo bài đăng
router.post("/create", auth, upload, createPost);

// Lấy gợi ý tin đăng - ĐÃ SỬA: /suggested (không có -posts)
router.get("/suggested", getSuggestedPosts);

// Lấy danh sách tiện ích
router.get("/amenities", async (req, res) => {
  try {
    const db = require("../config/db");
    const [rows] = await db.execute(
      "SELECT amenity_id, amenity_name, icon FROM amenities ORDER BY amenity_id ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Lỗi lấy tiện ích:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
