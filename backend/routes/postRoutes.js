const express = require("express");
const router = express.Router();

const {
  createPost,
  getSuggestedPosts,
} = require("../controllers/users/postController");

const upload = require("../utils/upLoadImage");
const auth = require("../middleware/authMiddleware");

// CREATE POST
router.post(
  "/create",
  auth,
  upload.array("images", 10),
  createPost
);

// GET SUGGESTED POSTS
router.get("/suggested", getSuggestedPosts);

// GET AMENITIES
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
