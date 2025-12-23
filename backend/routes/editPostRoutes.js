const express = require("express");
const router = express.Router();
const upload = require("../utils/upLoadImage");
const {
  getMyPosts,
  getMyPostDetail,
  updateMyPost,
  deleteMyPost,
} = require("../controllers/users/editPostController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getMyPosts);
router.get("/:id", authMiddleware, getMyPostDetail);
router.put("/:id", authMiddleware, upload.array("images", 10), updateMyPost);
router.delete("/:id", authMiddleware, deleteMyPost);
module.exports = router;
